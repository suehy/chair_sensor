import click
import logging
import json
import datetime
from os import listdir
from pandas import read_json
from pandas import DataFrame
import re
import csv

@click.command()
@click.argument('source', type=click.Path())
@click.argument('dest')
@click.argument('freq')
@click.option('--win')
def main(source, dest, freq, win):
    """ Preprocess data for model training """

    logger = logging.getLogger(__name__)
    logger.info('Preprocessing data from ' + source)

    subjects = load_dataset(source, freq)

    format = '%Y-%m-%dT%H:%M:%S.%fZ'
    for name in subjects:
        subjects[name].sort(key=lambda x: datetime.datetime.strptime(x['timestamp'], format))

    #shift_data(subjects, win)

    # Saving separate csv for each subject
    save_as_csv(subjects, dest, freq, win)

#def shift_data():


def save_as_csv(data, dest, freq, win):
    for subj in data:
        with open(dest + '/' + subj + freq + 'hz.csv', 'w') as outfile:
            f = csv.writer(outfile)
            f.writerow(['x', 'y', 'z', 'state'])
            for d in data[subj]:
                f.writerow([d['x'], d['y'], d['z'], d['state']])
            outfile.close()

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
