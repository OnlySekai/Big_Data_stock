## Environment

Recommend use K3D to config local cluster
### Create cluster
```
$ k3d cluster create my-cluster --servers 1 --agents 3
```
Create a cluster name my-cluster has 1 master node and 3 worker

View cluster info
```
$ k3d cluster list
NAME         SERVERS   AGENTS   LOADBALANCER
my-cluster   1/1       3/3      true
$ kubectl get nodes
NAME                      STATUS   ROLES                  AGE   VERSION
k3d-my-cluster-agent-0    Ready    <none>                 64m   v1.24.4+k3s1
k3d-my-cluster-server-0   Ready    control-plane,master   64m   v1.24.4+k3s1
k3d-my-cluster-agent-1    Ready    <none>                 64m   v1.24.4+k3s1
k3d-my-cluster-agent-2    Ready    <none>                 64m   v1.24.4+k3s1
```

## Deployment

### Create namespace kafka
```
$ kubectl apply -f nskafka.yaml
```

### Deploy zookeeper
```
$ kubectl apply -f zookeeper.yaml
```
Check zookeeper is deployed success
```
$ kubectl get pods -n kafka
NAME                         READY   STATUS              RESTARTS   AGE
zookeeper-<random digit>     1/1     Running             0          39m
```
### Deploy kafka
```
$ kubectl apply -f kafka.yaml
```
Check kafka is deployed success
```
$ kubectl get pods -n kafka
NAME                         READY   STATUS              RESTARTS   AGE
zookeeper-<random digit>     1/1     Running             0          39m
kafka-<random digit>         1/1     Running             0          24m
```
### Deploy producer and consumer
```
$ kubectl apply -f producer.yaml
$ kubectl apply -f consumer.yaml
```
Check producer and consumer are deployed success
```
$ kubectl get pods -n kafka
NAME                         READY   STATUS              RESTARTS   AGE
zookeeper-<random digit>     1/1     Running             0          39m
kafka-<random digit>         1/1     Running             0          24m
producer-<random digit>      1/1     Running             0          10m
consumer-<random digit>      1/1     Running             0          10m
```

### How to use your producer and consumer
Change image in line 19 of producer.yaml and consumer.yaml
```
-        - image: coverthe/producer_test_1:latest
+        - image: your-image           
```
Don't forget change ENV for your app

## Testing

### Testing producer

If using image coverthe/producer_test_1:latest, you can log producer
```
$ kubectl get pods
NAME                READY   STATUS             RESTARTS        AGE
<producer-pod-id>   1/1     Running            0               65m
$ kubectl logs <producer-pod-id> -n kafka
Kafka IP: kafka-service:9092
Send: {'symbol': 'AMZN', 'price': 0.796684434732368, 'time': '2022/12/21, 10:23:25'}
Send: {'symbol': 'AMZN', 'price': 0.4557338291280737, 'time': '2022/12/21, 10:23:31'}
Send: {'symbol': 'AMZN', 'price': 0.3420806457344633, 'time': '2022/12/21, 10:23:37'}
```

### Testing consumer

If using image coverthe/consumer_test_1:latest, you can log consumer
```
$ kubectl get pods
NAME                READY   STATUS             RESTARTS        AGE
<consumer-pod-id>   1/1     Running            0               65m
$ kubectl logs <consumer-pod-id> -n kafka
Kafka IP: kafka-service:9092
Receive: {'symbol': 'AMZN', 'price': 0.796684434732368, 'time': '2022/12/21, 10:23:25'}
Receive: {'symbol': 'AMZN', 'price': 0.4557338291280737, 'time': '2022/12/21, 10:23:31'}
Receive: {'symbol': 'AMZN', 'price': 0.3420806457344633, 'time': '2022/12/21, 10:23:37'}
```

### Testing kafka
```
$ kubectl get pods
NAME             READY   STATUS             RESTARTS        AGE
<kafka-pod-id>   1/1     Running            0               65m
$ kubectl exec -it <kafka-pod-id> -- /bin/sh
# 
```
then change directory to opt/kafka_2.13-2.8.1/bin
```
# cd opt/kafka_2.13-2.8.1/bin
```
List topic
```
# kafka-topics.sh --list --bootstrap-server kafka:9092
```
Open producer console
```
# kafka-console-producer.sh --bootstrap-server kafka:9092 --topic <topic-name>
```
Open consumer console
```
# kafka-console-consumer.sh --bootstrap-server kafka:9092 --topic <topic-name> --from-beginning
```




