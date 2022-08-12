// app.js
import express from "express";
// const express = require("express");
import mysql from "mysql2/promise";
import path from "path";
import cors from "cors";
import axios from "axios";
const __dirname = path.resolve();

const app = express();

app.use(express.json()); //할일수정
app.use(cors());

const port = 4000;

const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "a9",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.getData = async () => {
  const data = await axios.get("http://localhost:3000/todos");
  console.log("async await", data);
};

app.get("/todos", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM todo ORDER BY id DESC");
  res.json(rows);
});

//추가
app.post("/todos", async (req, res) => {
  const {
    body: { text },
  } = req;

  console.log(text);

  await pool.query(
    `
    INSERT INTO todo
    SET reg_date = NOW(),
    perform_date = '2022-05-18 07:00:00',
    checked = 0,
    text = ?
    `,
    [text]
  );

  //updatedTodos db추가
  const [updatedTodos] = await pool.query(
    `
    SELECT *
    FROM todo
    ORDER BY id
    DESC
    `
  );
  res.json(updatedTodos);
});

//todos 조회
app.get("/todos/:id", async (req, res) => {
  //const id = req.params.id;
  const { id } = req.params;

  const [todo] = await pool.query(
    `
  SELECT *
  FROM todo
  WHERE id = ?
  `,
    [id]
  );

  if (!todo) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  res.json(todo);
});

//todos 수정
app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { perform_date, text } = req.body;

  const [rows] = await pool.query(
    `
    select *
    from todo
    where id = ?
    `,
    [id]
  );

  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
  }

  if (!perform_date) {
    res.status(400).json({
      msg: "perform_date required",
    });
    return;
  }

  if (!text) {
    res.status(400).json({
      msg: "text required",
    });
    return;
  }
  const [rs] = await pool.query(
    `
    UPDATE todo
    SET perform_date = ?,
    text = ?
    WHERE id = ?
    `,
    [perform_date, text, id]
  );
  const [updatedTodos] = await pool.query(
    `
    SELECT *
    FROM todo
    ORDER BY id DESC
    `
  );

  res.json(updatedTodos);
});

//express, node.js db 수정
app.patch("/todos/check/:id", async (req, res) => {
  const { id } = req.params;
  const [[todoRow]] = await pool.query(
    `
    SELECT *
    FROM todo
    WHERE id = ?
    `,
    [id]
  );
  console.log(todoRow);

  if (!todoRow) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  await pool.query(
    //진짜 업데이트 해줘야함 , 포스트맨
    `
    UPDATE todo
    SET checked = ?
    WHERE id = ?
    `,
    [!todoRow.checked, id]
  );

  const [updatedTodos] = await pool.query(
    `
  SELECT *
  FROM todo
  ORDER BY id DESC
  `
  );

  res.json(updatedTodos);
});

///todos/check/:id 삭제
app.delete("/todos/check/:id", async (req, res) => {
  const { id } = req.params;
  const [[todoRow]] = await pool.query(
    `
    SELECT *
    FROM todo
    WHERE id = ?
    `,
    [id]
  );
  console.log(todoRow);
  if (todoRow === undefined) {
    res.status(404).json({
      msg: "not fount",
    });
    return;
  }
  await pool.query(
    `DELETE
     FROM todo
     WHERE id =?`,
    [id]
  );
  //반환update해줘서 onRemove에 삭제해도 가능한다
  const [updatedTodos] = await pool.query(
    `
  SELECT *
  FROM todo
  ORDER BY id DESC
  `,
    [id]
  );

  res.json(updatedTodos);
});

//todos 삭제
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  const [[todoRow]] = await pool.query(
    `
    SELECT * 
    FROM todo
    WHERE id =?`,
    [id]
  );

  if (todoRow === undefined) {
    res.status(404).json({
      msg: "not fount",
    });
    return;
  }

  const [rs] = await pool.query(
    `DELETE FROM todo
     WHERE id =?`,
    [id]
  );

  res.json({
    msg: `${id}가 삭제되었습니다.`,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
