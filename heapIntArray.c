#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <string.h>

int get_int(char str[]);
int char_to_int(char str);
int str_to_int(char *str);

int main(int argc, char *argv[])
{
	if (argc < 3)
	{
		printf("Expected at least 2 arguments but found %i.", argc - 1);
		return 1;
	}
	const int LIST_SIZE = str_to_int(argv[1]);
	int *list = malloc(LIST_SIZE * sizeof(int)); // add array to heap
	if (list == NULL)
	{
		printf("Error: Out of Memory. size requested: %i\n", LIST_SIZE);
		return 2;
	}
	for (int i = 0; i < LIST_SIZE; ++i)
	{
		printf("Integer %i: ", i + 1);
		list[i] = get_int("");
	}
	const int NEW_LIST_SIZE = str_to_int(argv[2]);
	int *tmp = malloc(NEW_LIST_SIZE * sizeof(int));
	if (tmp == NULL)
	{
		free(list);
		printf("Error: Out of Memory. size requested: %i\n", NEW_LIST_SIZE);
		return 3;
	}
	if (NEW_LIST_SIZE < LIST_SIZE)
	{
		printf("New Array:\n");
		for (int i = 0; i < NEW_LIST_SIZE; ++i)
		{
			tmp[i] = list[i];
		}
	}
	else
	{
		printf("New Elements:\n");
		for (int i = 0; i < LIST_SIZE; ++i)
		{
			tmp[i] = list[i];
		}
		for (int i = LIST_SIZE; i < NEW_LIST_SIZE; ++i)
		{
			printf("Integer %i: ", i + 1);
			tmp[i] = get_int("");
		}
	}
	free(list);
	list = tmp;
	printf("Output: [");
	int i = 0;
	for (; i < NEW_LIST_SIZE - 1; ++i)
	{
		printf("%i, ", list[i]);
	}
	printf("%i]\n", list[i]);
	free(list);
	return 0;
}

int str_to_int(char *str)
{
	for (int i = 0, n = strlen(str); i < n; ++i)
	{
		if (char_to_int(str[i]) < 0)
		{
			return -1;
		}
	}
	return atoi(str);
}

int get_int(char str[])
{
	int i;
	printf("%s",str);
	scanf("%i", &i);
	return i;
}

int char_to_int(char str)
{
	switch (str)
	{
		case '0': return 0; case '1': return 1;
		case '2': return 2; case '3': return 3;
		case '4': return 4; case '5': return 5;
		case '6': return 6; case '7': return 7;
		case '8': return 8; case '9': return 9;
		default: return -1;
	}
}
