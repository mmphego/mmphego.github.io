.PHONY: help build run stop start clean superclean log shell

help:
	@echo "Please use \`make <target>' where <target> is one of"
	@echo "  build				to build a jekyll docker container"
	@echo "  run 				to run pre-built jekyll container"
	@echo "  start  			to start an existing jekyll container"
	@echo "  stop   			to stop an existing jekyll container"
	@echo ""
	@echo "  log      			to see the logs of a running container"
	@echo "  shell      		to execute a shell on jekyll container"
	@echo ""
	@echo "  clean      		to stop and delete jekyll container"
	@echo "  superclean     	to clean and delete jekyll images"

build:
	@docker build -t jekyll .

run:
	@docker run --name=jekyll -v "$(PWD)":/site -p 4000:4000 jekyll

start:
	@docker start jekyll || true

stop:
	@docker stop jekyll || true

clean: stop
	@docker rm -v -f jekyll || true

superclean: clean
	@docker rmi -f jekyll || true

log:
	@docker logs -f jekyll

shell:
	@docker exec -it jekyll bash