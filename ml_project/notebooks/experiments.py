import pandas as pd
from pandas import read_csv
from pandas import DataFrame
import numpy as np
from sklearn.metrics import f1_score
# from numpy import mean
# from numpy import std
from numpy import dstack
import numpy as np
from pandas import read_csv
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.layers import Flatten
from tensorflow.keras.layers import Dropout
from tensorflow.keras.layers import LSTM
from keras.utils import to_categorical
# from keras.layers import Bidirectional
# from sklearn.metrics import confusion_matrix
# from sklearn.metrics import classification_report
from sklearn.model_selection import LeaveOneGroupOut
from os import listdir
from os import path
import re
import csv
import logging

# load a single file as a numpy array
def load_file(filepath):
    dataframe = read_csv(filepath, header=None)
    return dataframe.values

# load a list of files and return as a 3d numpy array
def load_group(filenames, prefix=''):
    loaded = list()
    for name in filenames:
        data = load_file(prefix + name)
        loaded.append(data)
    # stack group so that features are the 3rd dimension
    print('loaded', len(loaded[0]))
#     print('loaded', loaded)
    loaded = dstack(loaded)
    print('stacked', loaded.shape)
#     print('stacked', loaded)
    return loaded

# load a dataset group, such as train or test
def load_dataset_group(group, comb, prefix=''):
#     filepath = prefix + group + '/keras/'
    # load all 9 files as a single array
    filenames = list()
    # total acceleration
    filenames += ['total_acc_x_'+group+'_'+comb+'.csv', 'total_acc_y_'+group+'_'+comb+'.csv', 'total_acc_z_'+group+'_'+comb+'.csv']
    # load input data
    X = load_group(filenames, prefix)
    # load class output
    y = load_file(prefix + 'state_'+group+'_'+comb+'.csv')
    path = prefix + 'subjects_' + group + '_' +comb+'.csv'
    print(path)
    subjects = read_csv(path, header=None)
    print('done')
    return X, y, subjects

# load the dataset, returns train and test X and y elements
def load_dataset(comb,  prefix=''):
    # load all train
    trainX, trainy, subjects = load_dataset_group('train', comb, prefix)
    print(trainX.shape, trainy.shape)
    # load all test
#     testX, testy = load_dataset_group('test', freq, win, prefix)
#     print(testX.shape, testy.shape)
    # zero-offset class values
#     trainy = trainy - 1
#     testy = testy - 1
    # one hot encode y
#     trainy = to_categorical(trainy)
#     y_true = testy
#     testy = to_categorical(testy)
#     print(trainX.shape, trainy.shape)
    return trainX, trainy, subjects

# summarize scores
def summarize_results(scores):
    print(scores)
    m, s = mean(scores), std(scores)
    print('Accuracy: %.3f%% (+/-%.3f)' % (m, s))

# Define two neural networks: MLP and LSTM
def define_nns(n_timesteps, n_features, n_outputs, models=dict()):
    mlp = Sequential()
    mlp.add(Dense(n_features, input_shape=(n_timesteps,n_features), activation='relu'))
#     mlp.add(Dropout(0.5))
#     mlp.add(Dense(100, activation='relu'))
    mlp.add(Flatten())

    mlp.add(Dense(4, activation='softmax'))
    mlp.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['categorical_accuracy'])
    models['fnn'] = mlp

    lstm = Sequential()
    lstm.add(LSTM(n_features, input_shape=(n_timesteps,n_features), activation='relu'))
#     lstm.add(Dropout(0.5))
#     lstm.add(Dense(100, activation='relu'))
    lstm.add(Dense(n_outputs, activation='softmax'))
    lstm.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['categorical_accuracy'])
    models['lstm'] = lstm

    return models

def evaluate_model(trainX, trainy, testX, testy, y_true, model):
    verbose, epochs = 1, 10
#     trainy, testy = trainy[:,0], testy[:,0]
    # fit the model
    model.fit(trainX, trainy, epochs=epochs, verbose=verbose)
#     # make predictions
    yhat = model.predict_classes(testX)
#     print('yhat', yhat)
    f1_macro = f1_score(y_true, yhat, average='macro')
    f1_micro = f1_score(y_true, yhat, average='micro')
    f1 = f1_score(y_true, yhat, average=None)
    _, accuracy = model.evaluate(testX, testy, verbose=verbose)

#     _, accuracy = model.evaluate(testX, y_true, batch_size=batch_size, verbose=verbose)
#     print('accuracy:', accuracy)
#     print(classification_report(testy, yhat))
#     print(confusion_matrix(testy, yhat))
#     print(accuracy)
    return f1, f1_macro, f1_micro
#     return 0,0,0

def run_logo(X_all, y_all, groups, X_dummy):
    print(len(X_all))
    print(len(y_all))
    print(len(groups))
    logo = LeaveOneGroupOut()
    group = 0

    f1s = []
    f1_macros = []
    f1_micros = []

    results = []
    for train_indices, test_indices in logo.split(X_dummy, groups=groups[0:len(X_all)]):
        group += 1

        X_train, X_test = X_all[train_indices], X_all[test_indices]
        y_train, y_test = y_all[train_indices], y_all[test_indices]
        y_train = to_categorical(y_train)
        y_true = y_test
        y_test = to_categorical(y_test)

        key = 'lstm'
#         n_timesteps, n_features, n_outputs = trainX.shape[1], trainX.shape[2], to_categorical(trainy).shape[1]
        models = define_nns(n_timesteps=X_train.shape[1], n_features=X_train.shape[2], n_outputs=y_train.shape[1])
        f1, f1_macro, f1_micro = evaluate_model(X_train, y_train, X_test, y_test, y_true, models[key])
#         accuracy = evaluate_model(X_train, y_train, X_test, y_test, y_true, models['mlp'])
        f1s.append(f1)
        f1_macros.append(f1_macro)
        f1_micros.append(f1_micro)
#         print("Group {0} f1-scores: {1}".format(group, f1))
# #         print(f1_macros)
# #         print(f1_micros)

# #     return np.average(f1s, axis=0).tolist()
#         verbose, epochs, batch_size = 1, 100, 10
#         print('prefit')
#         clf.fit(X_train, y_train, epochs=epochs, batch_size=batch_size, verbose=verbose)
#         clf.fit(X_train, y_train, epochs=epochs, batch_size=batch_size, verbose=verbose)
#         print('fit')
#         _, accuracy = clf.evaluate(X_test, y_test, batch_size=batch_size, verbose=verbose)
# #         _, accuracy = clf.evaluate(X_test, y_test, batch_size=batch_size, verbose=verbose)
#         print('accuracy', accuracy)
#         results.append(accuracy)
#     return np.average(results)
    return {key: (np.average(f1s, axis=0).tolist(), [np.average(f1_macros).tolist()], [np.average(f1_micros).tolist()])}


# result = run_logo(model, trainX, trainy, subjects.iloc[:,0], X_dummy)
# print(result)

def main():
    source = '../data/processed/train/keras/'
    dest = 'results'
    i = 1

    for name in listdir(source):
        filename = source + '/' + name
        if not name.endswith('csv') or not name.startswith('total_acc_x_train_'):
            continue
        pattern = 'total_acc_x_train_' + '[0-9]*[0-9]_[0-9]*[0-9]_[0-9]*[0-9]' + '.csv'
        match = re.search(pattern, name)
        if not match:
            continue

        combi = re.search('train_(.+?).csv', name)
        if combi:
            combi = combi.group(1)

        trainX, trainy, subjects = load_dataset(comb=combi, prefix=source)
        # dummy dataset just for logo.split
        X_dummy = np.arange(len(trainX))

        results = run_logo(trainX, trainy, subjects.iloc[:,0], X_dummy)

        header = ['comb', 'f1-0', 'f1-1', 'f1-2', 'f1-2', 'macro f1', 'micro f1']

        for key in results:
            row = [combi]
            for e in results[key]:
                row.extend(e)

            outFilename = dest + '/' + key + '.csv'
            if not path.isfile(outFilename):
                print('creating new file', outFilename)
                with open(outFilename, 'w') as outFile:
                    writer = csv.writer(outFile)
                    writer.writerow(header)
                    writer.writerow(row)
                    outFile.close()
            else:
    #         row = [combi]
    #         row.extend(freq)
    #         writer = csv.writer(outFile)
    #         writer.writerow(row)
                print('opening existing file', outFilename)
                with open(outFilename, 'a+') as outFile:
                    writer = csv.writer(outFile)
                    writer.writerow(row)
                    outFile.close()
        i += 1

if __name__ == '__main__':
    log_fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(level=logging.INFO, format=log_fmt)
    main()
