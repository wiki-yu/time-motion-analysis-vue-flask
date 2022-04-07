# time-motion-analysis-app

It is a time-motion study demo including FE and BE

## Functions
1. Upload videos and images as data resources 
2. Streaming from webcam as data resources
3. Annotate videos for action recognition/localization
4. Training the action localization models with annotated data
5. Inference with action localization models with new data


## SET UP
### Clone the project
```
# clone the project
git clone https://github.com/wiki-yu/time-motion-analysis-vue-flask.git
```

## Backend set up

### Build virtual enviroment

```
# enter BE folder
cd time-motion-analysis-BE
cd app-auth

# install dependencies
npm install

# run the auth service
node auth.js
```

## Frontend set up
```
### enter FE folder
cd time-motion-analysis-FE
```
```
### install dependencies
npm install
```
```
### develop
npm run dev
```



