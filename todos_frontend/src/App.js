import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_TODOS = gql`
  query {
    todos {
      id
      title
      completed
    }
  }
`;

const CREATE_TODO = gql`
  mutation ($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      title
      completed
    }
  }
`;

const UPDATE_TODO = gql`
  mutation ($input: UpdateTodoInput!) {
    updateTodo(input: $input) {
      id
      title
      completed
    }
  }
`;

const DELETE_TODO = gql`
  mutation ($id: ID!) {
    deleteTodo(id: $id)
  }
`;



function App() {
  const { loading, data, error, refetch } = useQuery(GET_TODOS);
  const [createTodo] = useMutation(CREATE_TODO);
  const [updateTodo] = useMutation(UPDATE_TODO);
  const [deleteTodo] = useMutation(DELETE_TODO);
  const [title, setTitle] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;
    await createTodo({ variables: { input: { title } } });
    setTitle("");
    refetch();
  };

  const toggleComplete = async (todo) => {
    await updateTodo({
      variables: {
        input: {
          id: todo.id,
          completed: !todo.completed,
        },
      },
    });

    refetch();
  };

  const handleDelete = async (id) => {
    await deleteTodo({
      variables: {
        id,
      },
    });

    refetch();
  };

  if (loading) return <p>Loading...</p>;
if (error) return <p>Error loading todos</p>;
  return (
    <div className="App" style={{ padding: 20 }}>
      <h2>GraphQL Todo App</h2>
      <input
        placeholder="To do"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
      <ul>
        {data.todos.map((todo, index) => {
          return (<li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleComplete(todo)}
            />
            {todo.title}
            <button onClick={() => handleDelete(todo.id)}>❌</button>
          </li>)
        })}
      </ul>
    </div>
  );
}

export default App;
