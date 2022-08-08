// app.js
import express from "express";
// const express = require("express");
import mysql from "mysql2/promise";
import path from "path";
import cors from "cors";
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

app.get("/todos", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM todo ORDER BY id DESC");
  res.json(rows);
});

app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { perform_date, content } = req.body;
  console.log("id", id); //받아오는거 확인
  console.log("perform_date", perform_date);
  console.log("content", content);
});

//todos 조회
app.get("/todos/:id", async (req, res) => {
  //const id = req.params.id;
  const { id } = req.params;

  const [rows] = await pool.query(
    `
  SELECT *
  FROM todo
  WHERE id = ?
  `,
    [id]
  );

  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  res.json(rows[0]);
});

//todos 수정
app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { perform_date, content } = req.body;

  const [rows] = await pool.query(
    `
    select *
    from todo
    where id =>
    `[id]
  );

  if (res.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  if (!perform_date) {
    res.status(400).json({
      msg: "perform_date required",
    });
    return;
  }

  if (!content) {
    res.status(400).json({
      msg: "content required",
    });
    return;
  }
  const [rs] = await pool.query(
    `
    UPDATE todo
    SET perform_date = ?,
    content = ?
    WHERE id = ?
    `,
    [perform_date, content, id]
  );

  res.json({
    msg: `${id}번 할일이 수정되었습니다.`,
  });
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
  `,
    [id]
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
