import click
import logging
import json
import datetime
from os import listdir
from pandas import read_json
from pandas import DataFrame
import pandas as pd
import re
import csv
import math

@click.command()
@click.argument('source', type=click.Path())
@click.argument('dest')
@click.argument('freq')
@click.option('--win')
@click.option('--test') # number of subjects in test set
@click.option('--overlap')
def main(source, dest, freq, win, test, overlap):
    """ Preprocess data for model training and split into train/test set """

    logger = logging.getLogger(__name__)
    logger.info('Preprocessing data from ' + source)

    subjects = load_dataset(source, freq)

    print('bojan', len(subjects['bojan']))
    print('saeid', len(subjects['saeid']))
    print('dilhan', len(subjects['dilhan']))
    print('sue', len(subjects['sue']))

    format = '%Y-%m-%dT%H:%M:%S.%fZ'
    for name in subjects:
        subjects[name].sort(key=lambda x: datetime.datetime.strptime(x['timestamp'], format))

    if win == None:
        win = '1'

    print('Splitting raw data into seperate output files')

    filenames_train = ['total_acc_x_train', 'total_acc_y_train', 'total_acc_z_train', 'state_train']
    filenames_test = ['total_acc_x_test', 'total_acc_y_test', 'total_acc_z_test', 'state_test']

    filenames = []
    filenames.extend(filenames_train)
    filenames.extend(filenames_test)

    samples_dict = {}
    for name in filenames:
        samples_dict[name] = []

    nr_subjects = len(subjects.keys())
    i = 0
    total = 0
    for name in subjects:
        if i >= nr_subjects - int(test):
            print('test:', name)
            for j in range(len(subjects[name])):
                sample = subjects[name][j]
                samples_dict['total_acc_x_test'].append(sample['x'])
                samples_dict['total_acc_y_test'].append(sample['y'])
                samples_dict['total_acc_z_test'].append(sample['z'])
                samples_dict['state_test'].append(sample['state'])
        else:
            print('train:', name)
            for j in range(len(subjects[name])):
                sample = subjects[name][j]
                samples_dict['total_acc_x_train'].append(sample['x'])
                samples_dict['total_acc_y_train'].append(sample['y'])
                samples_dict['total_acc_z_train'].append(sample['z'])
                samples_dict['state_train'].append(sample['state'])
        i += 1

    print(len(samples_dict['total_acc_x_train']))
    print(len(samples_dict['state_train']))

    for filename in filenames_train:
        # put samples into window frames
        if filename == 'state_train':
            print('state_train')
            i = 0
            framed_samples = [[x] for x in samples_dict[filename][int(win)-1::int(win)]]
        else:
            i = 0
            framed_samples = []
            while i < len(samples_dict[filename]):
                framed_samples.append(samples_dict[filename][i:i+int(win)])
                i += int(win)
        with open(dest + '/train/' + filename + '_' + win + '_' + freq + '.csv', 'w') as outFile:
            writer = csv.writer(outFile)
            writer.writerows(framed_samples)
        outFile.close()

    for filename in filenames_test:
        if filename == 'state_test':
            print('state_test')
            framed_samples = [[x] for x in samples_dict[filename][int(win)-1::int(win)]]
        else:
            i = 0
            framed_samples = []
            while i < len(samples_dict[filename]):
                framed_samples.append(samples_dict[filename][i:i+int(win)])
                i += int(win)
        with open(dest + '/test/' + filename + '_' + win + '_' + freq + '.csv', 'w') as outFile:
            writer = csv.writer(outFile)
            writer.writerows(framed_samples)
        outFile.close()

    shifted_data = {}
    for name in subjects:
        data = pd.DataFrame.from_dict(subjects[name])
        shifted_data[name] = shift_data(data, int(win), overlap)
        shifted_data[name].insert(0, 'name', name)
        # Saving separate csv for each subject
        save_as_csv(shifted_data[name], name, dest, freq, win)

    if not test == None:
        print('Nr. subjects in dataset:', len(shifted_data.keys()))
        nr_subjects = len(shifted_data.keys())
        train_df = DataFrame()
        test_df = DataFrame()

        size = 0
        i = 0
        for name in shifted_data:
            if i >= nr_subjects - int(test):
                path = 'test/'
                print('test:', name)
                test_df = test_df.append(shifted_data[name])
                size += len(shifted_data[name])
            else:
                path = 'train/'
                print('train:', name)
                train_df = train_df.append(shifted_data[name])
                size += len(shifted_data[name])
            i += 1

        train_df.to_csv(dest + '/train.csv', index=False)
        test_df.to_csv(dest + '/test.csv', index=False)

# Split x, y and z samples based on window size and then merge them together into training and test samples
def split_merge_data(data, win, test):

    return 0

def shift_data(df, win, overlap_ratio):
    shifted_df = DataFrame()
    for i in range(0, win):
        shifted_df['x' + str(i)] = df['x'].shift(i)
        shifted_df['y' + str(i)] = df['y'].shift(i)
        shifted_df['z' + str(i)] = df['z'].shift(i)
    shifted_df['state'] = df['state']

    if overlap_ratio == None:
        overlap = 0
    else:
        overlap_ratio = float(overlap_ratio)
        overlap = overlap_ratio * win

        if win - overlap < 1:
            print('rounded down:', math.floor(overlap))
            overlap = math.floor(overlap)
        else:
            print('rounded down:', math.ceil(overlap))
            overlap = math.ceil(overlap)

    shifted_df = shifted_df.iloc[win-1::win-overlap, :]
    return shifted_df

def save_as_csv(df, subj, dest, freq, win):
    filename = dest + '/' + subj + win + '_' + freq + 'hz.csv'
    df.to_csv(filename, index=False)
    #for subj in data:
        # with open(dest + '/' + subj + freq + win + 'hz.csv', 'w') as outfile:
        #     f = csv.writer(outfile)
        #     # f.writerow(['x', 'y', 'z', 'state'])
        #     # for d in data:
        #     #     print(data)
        #     #     f.writerow([d['x'], d['y'], d['z'], d['state']])
        #     outfile.close()

def load_dataset(source, freq):
    subjects = {}
    for name in listdir(source):
        filename = source + '/' + name
        if not filename.endswith('.json'):
            continue
        pattern = '[a-zA-Z]' + freq + 'hz.json'
        match = re.search(pattern, name)
        if not match:
            continue
        #df = read_json(filename)
        with open(filename) as json_file:
            data = json.load(json_file)
            subject = ''.join(data.keys())
            subjects[subject] = data[subject]
            json_file.close()
    return subjects

if __name__ == '__main__':
    log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(level=logging.INFO, format=log_fmt)
    main()
