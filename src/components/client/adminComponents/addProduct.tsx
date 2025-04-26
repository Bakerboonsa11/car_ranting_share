'use client';

import React, { useState } from 'react';
import styles from '../../../styles/createKit.module.css';

const CreateKit = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,       // initialized as number
    discount: 0,    // initialized as number
    brand: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('price', formData.price.toString());
    data.append('discount', formData.discount.toString());
    data.append('brand', formData.brand);
    if (imageFile) {
      data.append('image', imageFile);
    }
  
    const res = await fetch('/api/kits', {
      method: 'POST',
      body: data,
    });
  
    if (res.ok) {
      setMessage('✅ Kit created successfully!');
      setTimeout(() => setMessage(''), 4000);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: 0,
        discount: 0,
        brand: '',
      });
      setImageFile(null);
    } else {
      let errorMessage = 'Something went wrong.';
      try {
        const err = await res.json();
        errorMessage = `❌ Error: ${err.message}`;
      } catch (err) {
        // If parsing fails, use the default error message
      }
      setMessage(errorMessage);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.formTitle}>Create New Kit</h2>

      <label className={styles.label}>Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className={styles.input}
        required
      />

      <label className={styles.label}>Description</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        className={styles.textarea}
        rows={3}
      />

      <label className={styles.label}>Category</label>
      <input
        type="text"
        name="category"
        value={formData.category}
        onChange={handleChange}
        className={styles.input}
        required
      />

      <label className={styles.label}>Price</label>
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        className={styles.input}
        required
      />

      <label className={styles.label}>Discount (%)</label>
      <input
        type="number"
        name="discount"
        value={formData.discount}
        onChange={handleChange}
        className={styles.input}
        min="0"
        max="100"
      />

      <label className={styles.label}>Image Upload</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className={styles.input}
      />

      <label className={styles.label}>Brand</label>
      <input
        type="text"
        name="brand"
        value={formData.brand}
        onChange={handleChange}
        className={styles.input}
      />

      <button type="submit" className={styles.button}>Create Kit</button>

      {message && <p className={styles.message}>{message}</p>}
    </form>
  );
};

export default CreateKit;
