import click
import logging
import requests

@click.command()
@click.argument('source')
@click.argument('dest', type=click.Path())
@click.option('--subject', help='filter data by subject name')
def main(source, dest, subject):
    """ Downloads raw dataset from <SOURCE> to <DEST> """

    logger = logging.getLogger(__name__)
    logger.info('Downloading raw dataset from ' + source)

    params = {}
    if subject != None:
        params = {'subject': subject}

    res = requests.get(source, params=params)
    if res.status_code == requests.codes.ok:
        dataset = res.text
        f = open(dest, 'w')
        f.write(dataset)
        f.close()

if __name__ == '__main__':
    log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(level=logging.INFO, format=log_fmt)
    main()
