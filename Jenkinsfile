pipeline {
    agent any
    stages {
        stage('Install') {
            steps {
                echo 'Installing dependencies...'
                sh 'make install'
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                sh 'make test'
            }
        }
        stage('Build') {
            steps {
                echo 'Building project...'
                sh 'make build'
            }
        }
    }
}