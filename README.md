# Todolist 后端项目

## 项目概述

本项目是一个 Todolist 应用的后端服务，提供了一系列 RESTful API 接口，用于管理用户的任务列表。项目包括两个主要的数据模型：`Topic` 和 `Todo`，以及对应的数据库表结构。

## 数据模型

### Topic 数据模型

- `id`: 整数，唯一标识符。
- `topicTitle`: 字符串，主题的标题。
- `topicDescription`: 字符串，主题的描述（可为空）。

### Todo 数据模型

- `id`: 整数，唯一标识符。
- `todoTitle`: 字符串，待办事项的标题。
- `todoContent`: 字符串，待办事项的具体内容。
- `todoStatus`: 整数，表示待办事项的完成状态。
- `topicTitle`: 字符串，所属主题的标题。
- `deadline`: 日期，待办事项的截止日期。

## API 接口

1. getTopics
2. getTodosByTopic
3. getTodosAll
4. addTopic
5. addTodo
6. deleteTodoById
7. deleteTopicById
8. updateTodoStatusById
9. updateTodoRecordById
10. updateTopicById

详细信息请参考 -[后端接口.md](doc/规范后端接口.md)

## 数据库结构

### `topics` 表

- `id`: 主题 ID，主键。
- `topic_title`: 主题名称。
- `topic_content`: 主题描述（可空）。

### `todos` 表

- `id`: 待办事项 ID，主键。
- `todo_title`: 待办事项文本。
- `deadline`: 截止日期（可空）。
- `topic_id`: 外键，指向 `topics` 表。
- `todo_content`: 待办事项具体内容。
- `todo_status`: 待办事项的完成情况。

详细信息请参考 -[数据库表结构](doc/数据库表结构.md)


## 安装与部署

建议使用cloudflare workers SDK wrangler进行本地开发调试与部署

具体细节可以参考cloudflare的官方workers教程，如下：[https://developers.cloudflare.com/workers/](https://developers.cloudflare.com/workers/)


## 使用注意

虽然已经为后端添加了CORS配置，但是还是建议使用KONG(NGINX)等api gateway服务进行统一的api管理以及代理，保证api的访问安全性与稳定性

由于后端的鉴权模块仍然未完善，因此可能存在一定的安全风险。
