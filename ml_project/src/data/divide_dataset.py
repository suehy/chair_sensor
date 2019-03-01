import click
import logging
import json
import datetime

@click.command()
@click.argument('source', type=click.Path())
@click.argument('dest', type=click.Path())
@click.option('--freq')
def main(source, dest, freq):
    """ Sort and divide dataset by frequency """

    logger = logging.getLogger(__name__)
    logger.info('Diviving raw dataset from ' + source + ' by ' + freq + ' Hz')

    with open(source) as json_file:
        data = json.load(json_file)['data']
        json_file.close()

        dataByName = {}
        for e in data:
            key = e['subject']
            if not key in dataByName:
                dataByName[key] = []
            del e['subject']
            del e['_id']
            dataByName[key].append(e)

        format = '%Y-%m-%dT%H:%M:%S.%fZ'
        for name in dataByName:
            dataByName[name].sort(key=lambda x: datetime.datetime.strptime(x['timestamp'], format))

        f = open(dest, 'w')
        f.write(json.dumps(dataByName))
        f.close()

        # countList = []
        # count = 0
        # sec = -1
        # for e in dataByName['nimat']:
        #     date = datetime.datetime.strptime(e['timestamp'], format)
        #     if not sec == date.second:
        #         if not sec == -1:
        #             countList.append(count)
        #         sec = date.second
        #         count = 0
        #     count += 1
        #
        # print(countList)

        #divide by frequency
        if not freq == None:
            dividedData = {}
            step = 200/int(freq)
            for subj in dataByName:
                dividedData[subj] = []
                for i, val in enumerate(dataByName[subj]):
                    if i % step == 0:
                        dividedData[subj].append(dataByName[subj][i])
            f = open('../../data/interim/' + freq + 'hz.json', 'w')
            f.write(json.dumps(dividedData))
            f.close()
            # print(len(dividedData['flori']))
            # print(len(dataByName['flori']))

if __name__ == '__main__':
    log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(level=logging.INFO, format=log_fmt)
    main()