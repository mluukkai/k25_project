const axios = require('axios');

const main = async () => {
  const url = 'https://en.wikipedia.org/wiki/Special:Random'
  const response = await axios.get(url);
  const responseUrl = response.request.res.responseUrl 
  console.log(`Read ${responseUrl}`);

  const todo = {
    content: `Read ${responseUrl}`,
  }

  const todoUrl = process.env.TODO_BACKEND_URL;

  console.log(`Creating todo in ${todoUrl}`);

  try {
    const responseTodo = await axios.post(todoUrl, todo);
    console.log(`Created todo: ${responseTodo.data.content}`);
  } catch (error) {
    console.error('Error creating todo:', error.message);
  }
}

main()