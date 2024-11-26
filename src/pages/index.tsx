// pages/index.js

"use client";
import React from 'react';
import ExportButton from '../components/ExportButton';
import MyForm from '@/components/forms/MyForm';

const Home = () => (
  <div>
    <h1>Export Forms</h1>
    <MyForm/>
    <ExportButton formName="MyForm" />
  </div>
);

export default Home;
