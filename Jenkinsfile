pipeline {
    agent any

    options {
        disableConcurrentBuilds()
    }

    stages {
        stage('Backend') {
            steps {
                bat 'mvnw.cmd -B verify'
            }
        }

        stage('Frontend') {
            steps {
                dir('front-end') {
                    bat 'npm ci'
                    bat 'npm run lint'
                    bat 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline OK: backend y frontend compilan y pasan las pruebas.'
        }
        failure {
            echo 'Pipeline FALLIDO: revisa la etapa que falló en el log.'
        }
    }
}
