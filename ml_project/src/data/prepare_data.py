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

    format = '%Y-%m-%dT%H:%M:%S.%fZ'
    for name in subjects:
        subjects[name].sort(key=lambda x: datetime.datetime.strptime(x['timestamp'], format))

    if win == None:
        win = '1'

    shifted_data = {}
    for name in subjects:
        data = pd.DataFrame.from_dict(subjects[name])
        shifted_data[name] = shift_data(data, int(win), overlap)
        # Saving separate csv for each subject
        save_as_csv(shifted_data[name], name, dest, freq, win)

    if not test == None:
        print('Nr. subjects in test size:', len(shifted_data.keys()))
        nr_subjects = len(shifted_data.keys())
        train_df = DataFrame()
        test_df = DataFrame()

        size = 0
        i = 0
        for name in shifted_data:
            print(name)
            if i >= nr_subjects - int(test):
                test_df = test_df.append(shifted_data[name])
                size += len(shifted_data[name])
            else:
                train_df = train_df.append(shifted_data[name])
                size += len(shifted_data[name])
            i += 1

        train_df.to_csv(dest + '/train.csv', index=False)
        test_df.to_csv(dest + '/test.csv', index=False)

def split_data(test_size):
    return 0

def shift_data(df, win, overlap):
    shifted_df = DataFrame()
    for i in range(0, win):
        shifted_df['x' + str(i)] = df['x'].shift(i)
        shifted_df['y' + str(i)] = df['y'].shift(i)
        shifted_df['z' + str(i)] = df['z'].shift(i)
    shifted_df['state'] = df['state']

    # Calculate overlap percentage
    # if overlap == None:
    #     overlap = 0

    #shifted_df.drop(shifted_df.index[:win-1], inplace=True)
    shifted_df = shifted_df.iloc[win-1::win, :]
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
