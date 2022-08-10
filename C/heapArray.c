#include "builtins.h"

// basically alloc and realloc but without realloc
int main(int argc, char *argv[]) {
	if (argc < 3) {
		printf("Expected at least 2 arguments but found %i.\narguments: 1st list size, 2nd list size", argc - 1);
		return 1;
	}
	const int LIST_SIZE = atoi(argv[1]),
		NEW_LIST_SIZE = atoi(argv[2]);
	int *list = (int*) malloc(LIST_SIZE * sizeof(int));
	if (list == NULL) {
		fprintf(stderr, "Error: Out of Memory. size requested: %i\n", LIST_SIZE);
		return 2;
	}
	for (int i = 0; i < LIST_SIZE ;) {
		printf("Integer %i: ", ++i);
		scanf("i", &list[i]);
	}
	int *tmp = malloc(NEW_LIST_SIZE * sizeof(int));
	if (tmp == NULL) {
		free(list);
		fprintf(stderr, "Error: Out of Memory. size requested: %i\n", NEW_LIST_SIZE);
		return 3;
	}
	if (NEW_LIST_SIZE < LIST_SIZE) {
		printf("New Array:\n");
		for (int i = 0; i < NEW_LIST_SIZE; ++i)
			tmp[i] = list[i];
	} else {
		printf("New Elements:\n");
		for (int i = 0; i < LIST_SIZE; ++i) tmp[i] = list[i];
		for (int i = LIST_SIZE; i < NEW_LIST_SIZE; ++i) {
			printf("Integer %i: ", i + 1);
			scanf("%i", &tmp[i]);
		}
	}
	free(list);
	list = tmp;
	printf("Output: [");
	int i = 0;
	for (; i < NEW_LIST_SIZE - 1 ;)
		printf("%i, ", list[i++]);
	printf("%i]\n", list[i]);
	free(list);
	return 0;
}