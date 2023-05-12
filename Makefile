run-service : 
	docker stop hubapi-container | exit
	docker rm hubapi-container | exit
	docker image rm hubapi | exit
	docker build -t hubapi . && docker run --name hubapi-container -p 9146:9146 -d hubapi
	
 
 