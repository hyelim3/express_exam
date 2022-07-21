// app.js
import express from "express";
// const express = require("express");
import mysql from "mysql2/promise";
const app = express();
app.use(express.json());

const port = 3000;

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
  console.log(id); //받아오는거 확인
  console.log(perform_date);
  console.log(content);
});

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

app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { perfomr_date, content } = req.body;

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

app.get("/a.html", (req, res) => {
  //get: 주소
  console.log("/a.html 요청이 실행되었습니다.");
  res.send("Hello world");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
