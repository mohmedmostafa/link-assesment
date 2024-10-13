to run the project
# orchastrator  
- minikube start

# Ensure Docker environment is configured for Minikube
-eval $(minikube docker-env)

-docker build -t node-app:1.0 .

# Apply the deployment
kubectl apply -f deployment.yaml

# Apply the service
kubectl apply -f service.yaml

minikube service node-app-service

