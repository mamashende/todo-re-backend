import { escapeHtml } from './escape.js';

export default {
  async fetch(request, env) {
    const db = env.DB;

    async function getTodos() {
      const query = 'SELECT * FROM todolist';
      const { results } = await db.prepare(query).all();
      const data = {
        todos: results?.map(todo => ({
          id: escapeHtml(todo.id),
          title: escapeHtml(todo.todo_title),
          content: escapeHtml(todo.todo_content),
          status: !!todo.todo_status // 将整数转换为布尔值
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

    async function updateTodos(request) {
      const body = await request.json();
      const { id, todo_title,todo_content,status } = body;
      if (id === undefined || status === undefined) {
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
        UPDATE todolist 
        SET todo_status = ?,todo_title = ?,todo_content = ?
        WHERE id = ?
      `;
      await db.prepare(query).bind(status ? 1 : 0,todo_title,todo_content, id).run(); // 将布尔值转换为整数

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
      let { todo_title, todo_content, status } = body;
      todo_title = String(todo_title);
      todo_content = String(todo_content);
      status = status ? 1 : 0; // 将布尔值转换为整数

      const query0 = 'SELECT * FROM todolist';
      const { results } = await db.prepare(query0).all();
      const data = { todos: results };

      let maxId = data.todos.length === 0 ? 1 : Math.max(...data.todos.map(todo => todo.id)) + 1;

      const query = `
        INSERT INTO todolist (id, todo_title, todo_content, todo_status)
        VALUES (?, ?, ?, ?)
      `;
      await db.prepare(query).bind(maxId, todo_title, todo_content, status).run();
      const newTodo = { id: maxId, title: todo_title, content: todo_content, status: !!status };
      return new Response(JSON.stringify(newTodo), { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
        }
      });
    }

    async function deleteTodo(request) {
      const body = await request.json();
      const { id } = body;

      const query = `
        DELETE FROM todolist
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
    if (request.method === 'GET') {
      return getTodos();
    } else if (request.method === 'POST') {
      return addTodo(request);
    } else if (request.method === 'PUT'){
      return updateTodos(request);
    } else if(request.method === 'DELETE'){
      return deleteTodo(request);
    } else if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST,PUT,DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
        }
      });
    } else {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*', // 设置CORS头
          'Access-Control-Allow-Methods': 'GET, POST,PUT,DELETE, OPTIONS', // 允许的方法
          'Access-Control-Allow-Headers': 'Content-Type' // 允许的头
        }
      });
    }
  }
};