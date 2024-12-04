import { escapeHtml } from './escape.js';

export default {
  async fetch(request, env) {
    const db = env.DB;
    //获取所有todo
    async function getTodosAll() {
      const query = 'SELECT * FROM todos';
      const { results } = await db.prepare(query).all();
      console.log({results});
      const data = {
        todos: results?.map(todo => ({
          id: escapeHtml(todo.id),
          todoTitle: escapeHtml(todo.todo_title),
          todoContent: escapeHtml(todo.todo_content),
          topicId : escapeHtml(todo.topic_id),
          deadline: escapeHtml(todo.deadline),
          todoStatus: !!todo.todoStatus // 将整数转换为布尔值
        })) ?? []
      };
      console.log(data);
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=15', // 缓存15秒
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
        }
      });
    }
    async function getTodosByTopic(request) {
        const body = await request.json();
        let {id} = body;
        const query = `
        SELECT * FROM todos 
        WHERE id = ?
        `;
        const {results} = await db.prepare(query).bind(id).run();
        const data = {
            todos: results?.map(todo => ({
              id: escapeHtml(todo.id),
              todoTitle: escapeHtml(todo.todo_title),
              todoContent: escapeHtml(todo.todo_content),
              deadline: escapeHtml(todo.deadline),
              todoStatus: !!todo.todo_status // 将整数转换为布尔值
            })) ?? []
          };

          return new Response(JSON.stringify(data), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'max-age=15', // 缓存15秒
              'Access-Control-Allow-Origin': '*', // 设置CORS头
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
              'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
            }
          });
    }


async function getTopics() {
    const query = `SELECT * FROM topics`;
    const {results} = await db.prepare(query).all();
    const data = {
        topics: results?.map(topic => ({
          id: escapeHtml(topic.id),
          topicTitle: escapeHtml(topic.topic_title),
          topicContent: escapeHtml(topic.topic_content),
        })) ?? []
      };

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=15', // 缓存15秒
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
        }
      });
}

    async function addTopic(request) {
        const body =await request.json();
        //console.log(body);
        let {topicTitle,topicContent} = body;
        topicTitle = String(topicTitle);
        topicContent = String(topicContent);
        const query0 = 'SELECT * FROM topics';
        const { results } = await db.prepare(query0).all();
        const data = { topics: results };
        //console.log(data);
        let maxId = data.topics.length === 0 ? 1 : Math.max(...data.topics.map(topic => topic.id)) + 1;

        const query = `INSERT INTO topics (id,topic_title,topic_content)
        VALUES (?,?,?)
        `;
        await db.prepare(query).bind(maxId,topicTitle,topicContent).run();

        const newTopic = {id:maxId,topicTitle:topicTitle,topicContent:topicContent};
        return new Response(JSON.stringify(newTopic), {
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'max-age=15', // 缓存15秒
              'Access-Control-Allow-Origin': '*', // 设置CORS头
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
              'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
            }
          });
    }



    async function updateTodoStatusById(request) {
      const body = await request.json();
      console.log(body);
      const { id, todoStatus } = body;
      
      if (id === undefined || todoStatus === undefined) {
        return new Response(JSON.stringify({ error: 'Invalid data' }), { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*', // 设置CORS头
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
            'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
          }
        });
      }

      const query = `
        UPDATE todos 
        SET todo_status = ?
        WHERE id = ?
      `;
      await db.prepare(query).bind(todoStatus ? 1 : 0, id).run(); // 将布尔值转换为整数

      return new Response(JSON.stringify(body), { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
        }
      });
    }



    async function updateTopicById(request) {
        const body = request.json();
        let {id,topicTitle,topicContent} = body;
        const query = `
        UPDATE FROM topics
        SET topic_title = ? , topic_content = ?
        WHERE id = ?
        `;

        await db.prepare(query).bind(topicTitle,topicContent,id).run();
        
        return new Response(JSON.stringify(body), { 
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*', // 设置CORS头
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
              'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
            }
          });


    }
    

    async function updateTodoRecordById(request) {
        const body = await request.json();
        const { id, todoTitle,todoContent,topicId,todoStatus,deadline } = body;
        console.log(body);
        if (id === undefined || todoStatus === undefined) {
          return new Response(JSON.stringify({ error: 'Invalid data' }), { 
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*', // 设置CORS头
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
              'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
            }
          });
        }
        

        //防止将topic改为不存在的值
        const query0 = `
          SELECT * FROM topics
          WHERE id = ?
        `;

        const { results } = await db.prepare(query0).bind(topicId).all();
        const data = { topics: results };

        if (data.topics.length === 0){
            return new Response(JSON.stringify({ error: 'Invalid data' }), { 
                status: 400,
                headers: {
                  'Access-Control-Allow-Origin': '*', // 设置CORS头
                  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
                  'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
                }
              });
        }


        const query = `
          UPDATE todos 
          SET todo_status = ?,todo_title = ?,todo_content = ?,topic_Id = ?,deadline = ?
          WHERE id = ?
        `;
        await db.prepare(query).bind(todoStatus ? 1 : 0,todoTitle,todoContent,topicId,deadline, id).run(); // 将布尔值转换为整数
  
        return new Response(JSON.stringify(body), { 
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*', // 设置CORS头
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
            'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
          }
        });
      }

    async function addTodo(request) {
      const body = await request.json();
      let { todoTitle, todoContent, todoStatus ,topicId,deadline} = body;
      todoTitle = String(todoTitle);
      todoContent = String(todoContent);
      todoStatus = todoStatus ? 1 : 0; // 将布尔值转换为整数
      
      

      const query0 = 'SELECT * FROM todos';
      const { results } = await db.prepare(query0).all();
      const data = { todos: results };
      
      let maxId = data.todos.length === 0 ? 1 : Math.max(...data.todos.map(todo => todo.id)) + 1;

      const query = `
        INSERT INTO todos (id, todo_title, todo_content, todo_status, topic_Id,deadline)
        VALUES (?, ?, ?, ?, ?,?)
      `;
      await db.prepare(query).bind(maxId, todoTitle, todoContent, todoStatus,topicId,deadline).run();
      const newTodo = { id: maxId, todoTitle:todoTitle, todoContent: todoContent, todoStatus: !!todoStatus ,topicId:topicId,deadline:deadline};
      return new Response(JSON.stringify(newTodo), { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
        }
      });
    }

    async function deleteTodoById(request) {
      const body = await request.json();
      const { id } = body;

      const query = `
        DELETE FROM todos
        WHERE id = ?
      `;
      await db.prepare(query).bind(id).run();

      return new Response(JSON.stringify(body), { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
        }
      });
    }

    async function deleteTopicById(request) {
        const body = await request.json();
        const { id } = body;
        const query0 = `
          SELECT * FROM todos
          JOIN topics ON topics.id = todos.topic_Id
          WHERE topics.id = ?
        `;

        const {results} = await db.prepare(query0).bind(id).run();
        const data = {topics : results};

        let count = data.topics.length;
        if (count > 0){
            return new Response(JSON.stringify({ error: 'Topic is not empty' }), { 
                status: 400,
                headers: {
                  'Access-Control-Allow-Origin': '*', // 设置CORS头
                  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
                  'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
                }
              });
        }

        const query = `
          DELETE FROM topics
          WHERE id = ?
        `;

        await db.prepare(query).bind(id).run();

        return new Response(JSON.stringify(body), { 
          status: 200,
          headers: {
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
            }
        });

    }




    // 根据请求方法调用相应的函数
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'GET' && pathname === '/todos') {
      return getTodosAll();
    } else if (request.method === 'GET' && pathname === '/topics') {
      return getTopics();
    } else if (request.method === 'POST' && pathname === '/todos') {
      return addTodo(request);
    } else if (request.method === 'POST' && pathname === '/topics') {
      return addTopic(request);
    } else if (request.method === 'PUT' && pathname === '/todos/status') {
      return updateTodoStatusById(request);
    } else if (request.method === 'PUT' && pathname === '/todos') {
      return updateTodoRecordById(request);
    } else if (request.method === 'PUT' && pathname === 'topics'){
        return updateTopicById(request);
    }else if (request.method === 'DELETE' && pathname === '/todos') {
      return deleteTodoById(request);
    } else if (request.method === 'DELETE' && pathname === '/topics') {
      return deleteTopicById(request);
    } else if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
        }
      });
    } else {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
        }
      });
    }
  }
};