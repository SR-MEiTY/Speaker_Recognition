#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Jul 21 16:24:13 2022

@author: Mrinmoy Bhattacharjee, Senior Project Engineer, IIT Dharwad
"""

from flask import Flask, render_template, request, redirect, flash, url_for
from functools import wraps
import csv
import os
#Packages required for training and verification of the audio files
import numpy as np
import librosa as lb

os.environ["FLASK_RUN_PORT"] = '443'
from scipy.io.wavfile import read
from sklearn.mixture import GaussianMixture as GMM
from pydub import AudioSegment
import pickle
import warnings
warnings.filterwarnings("ignore")



#Directories to store audio data of speaker for training and testing 
TRAIN_FOLDER = 'static/train_data/'
TEST_FOLDER = 'static/test_data/'

#Flask Server Instance
app = Flask(__name__)

#Default route to load home page of the web app
@ app.route('/', methods = ['POST', 'GET'])
def root():
	return render_template('new/home.html');

#This route load the registration page for the user
@ app.route('/registration', methods = ['POST'])
def registration():
	return render_template('new/registration.html');

#This route loads the verification page for the user
@ app.route('/verification', methods = ['POST'])
def testing():
	return render_template('new/verification.html');

#This route loads the contact details page to contact the admin
@ app.route('/contactus', methods = ['POST'])
def contactus():
	return render_template('contactus.html');

#This route performs the following functionalities:
#Fetches speaker details from the HTML form and store it in the csv file
#Creates the speaker ID
#Creates the training and testing directories for the speaker with created speaker IS
#Stores the audio file from the client broswer in current speaker's training directory
#Extracts the audio features and generates the .gmm file for further usage
@ app.route('/uploadTAudio', methods = ['POST'])
def uploadTAudio():
	if request.method == 'POST':
		file = request.files['audioChunk'];
		firstName = request.form['firstName'];
		lastName = request.form['lastName'];
		gender = request.form['gender'];
		age = request.form['age'];
		
		speakerID = firstName[0].upper()+lastName[0].upper()+gender+age;
		
		row = [firstName, lastName, gender, age, speakerID]

		isTraindir = os.path.isdir(TRAIN_FOLDER + speakerID)
		isTestdir = os.path.isdir(TEST_FOLDER + speakerID)
		print(isTraindir)
		print(isTestdir)
		if isTraindir == False and isTestdir == False: 
			os.mkdir(TRAIN_FOLDER + speakerID);
			os.mkdir(TEST_FOLDER + speakerID);
			print('Training directory for ' + speakerID +' created successfully.');
			print('Verification directory for ' +speakerID +' created successfully.');
		else:
			print('Directory already exists for the speaker!')
			print('Skipping the directory creation for Training Data...')
			print('Skipping the directory creation for Testing Data...')
		csvfile = open('static/speakerinfo.csv', 'a', newline='');
		writer = csv.writer(csvfile);
		writer.writerow(row);
		csvfile.close();
		file_name = speakerID + ".wav"
		full_file_name = os.path.join(TRAIN_FOLDER+speakerID, file_name)
		file.save(full_file_name)

		path2str  = "static/train_data/"  
		id=speakerID
		sr=8000

		wavfilepath=path2str+id+ '/'+id+'.wav'
		y,sr=lb.load(wavfilepath,sr=sr)
		features  = extract_features(y,sr)
		gmm = GMM(n_components = 16, max_iter=50, n_init = 3)
		gmm.fit(features)
		model_save = path2str+id+'/'+id+".gmm"
		pickle.dump(gmm,open(model_save,'wb'))
		if isTraindir and isTestdir:
			return_string = id + ' already exists. Overwriting the existing file, if any...'
			return return_string
		else:
			return_string = 'Please note down your Speaker ID: '+id
			return return_string

#This route performs the following functionalities:
#Fetches the speaker ID from the web browser and checks whether it is in the testing direcory or not
#Fetches the audio from web browser and stores it in the current speaker's testing directory
#Extracts the features from the audio
#Loads the .gmm file from the current user's training directory and calculates the score
#based on the score it returns whether speaker is recognized or not.
@ app.route('/uploadVAudio', methods = ['POST'])
def uploadVAudio():
	if request.method == 'POST':
		file = request.files['audioChunk'];
		sid = request.form['sid'].upper();

		csv_file = open('static/speakerinfo.csv', "r");
		reader = csv.reader(csv_file)
		isFound = False
		for row in reader:
			if sid == row[4]:
				isFound = True
				break
			else:
				continue
			print(isFound)
		if isFound:
			file_name = sid + ".wav"
			full_file_name = os.path.join(TEST_FOLDER+sid, file_name)
			file.save(full_file_name)

			path2str  = "static/test_data/"  
			id=sid
			sr=8000
			#%%
			wavfilepath=path2str+id+ '/'+id+'.wav'
			y,sr=lb.load(wavfilepath,sr=sr)
			features  = extract_features(y,sr)

			model_load='static/train_data/'+id;

			model_load_path=model_load+'/'+id+'.gmm'
			model=pickle.load(open(model_load_path,'rb'))

			score=model.score(features)

			th=-100
			op=verify(score,th)
			print(op)
			if op == 1:
				#output = "Speaker Recognized"
				return "1";
			else:
				#output = "Speaker not Recognized"
				return "0";
		else:
			return "-1"

#This function is used to extract the features from the audio
def extract_features(y,sr):
	mfcc = lb.feature.mfcc(y=y, sr=sr,n_mfcc=14)
	mfcc_delta = lb.feature.delta(mfcc)
	mfcc_delta2 = lb.feature.delta(mfcc, order=2)

	mfcc = mfcc[1:]
	mfcc_delta = mfcc_delta[1:]
	mfcc_delta2 = mfcc_delta2[1:]
	combined = np.hstack((mfcc.T,mfcc_delta.T, mfcc_delta2.T)) 
	return combined

#This function is compares the score with threshold and return 0 or 1 based on the comparison
def verify(score,th):
    if score>=th:
        op=1
    else:
        op=0
    return op

if __name__ == '__main__':
    app.config['TRAIN_FOLDER'] = TRAIN_FOLDER
    app.config['TEST_FOLDER'] = TEST_FOLDER
    # Local
    # context = ('certificate.pem', 'privateKey.pem')
    # app.run(host="127.0.0.1", debug=True, port=8888)
    
    # IIT-Dh server
    context = ('flaskssl/1f9476e3959ebe60.crt', 'flaskssl/star_iitdh_key.key')
    app.run(host="0.0.0.0", debug=True, port=443, ssl_context=context)
    