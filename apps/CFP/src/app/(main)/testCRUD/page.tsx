'use client';

import React, { useState } from 'react';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Table, THead, TBody, Tr, Th, Td } from '@packages/components/bootstrap5/Table';
import { Input } from '@packages/components/bootstrap5/Input';
import Card from '@packages/components/bootstrap5/Card';

interface Item {
  id: number;
  name: string;
  description: string;
}

export default function TestCRUDPage() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: '項目 A', description: '這是第一個範例項目' },
    { id: 2, name: '項目 B', description: '這是第二個範例項目' },
  ]);

  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create or Update
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId !== null) {
      // Update
      setItems(items.map((item) => (item.id === editingId ? { ...item, ...formData } : item)));
      setEditingId(null);
    } else {
      // Create
      const newItem = {
        id: Date.now(),
        ...formData,
      };
      setItems([...items, newItem]);
    }
    setFormData({ name: '', description: '' });
  };

  // Edit
  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setFormData({ name: item.name, description: item.description });
  };

  // Delete
  const handleDelete = (id: number) => {
    if (confirm('確定要刪除嗎？')) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="container py-4">
      <h1>CRUD 範例頁面</h1>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{editingId !== null ? '編輯項目' : '新增項目'}</Card.Title>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-4">
              <Input
                label="名稱"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="請輸入名稱"
                required
              />
            </div>
            <div className="col-md-6">
              <Input
                label="描述"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="請輸入描述"
              />
            </div>
            <div className="col-md-2 d-flex align-items-end gap-2">
              <Btn type="submit" color="primary" outline={false} icon={editingId !== null ? 'save' : 'add'}>
                {editingId !== null ? '儲存' : '新增'}
              </Btn>
              {editingId !== null && (
                <Btn color="secondary" onClick={handleCancel} icon="xmark">
                  取消
                </Btn>
              )}
            </div>
          </form>
        </Card.Body>
      </Card>

      <Table striped hover bordered>
        <THead dark>
          <Tr>
            <Th style={{ width: '80px' }}>ID</Th>
            <Th>名稱</Th>
            <Th>描述</Th>
            <Th style={{ width: '200px' }}>操作</Th>
          </Tr>
        </THead>
        <TBody>
          {items.length > 0 ? (
            items.map((item) => (
              <Tr key={item.id}>
                <Td>{item.id}</Td>
                <Td>{item.name}</Td>
                <Td>{item.description}</Td>
                <Td>
                  <div className="d-flex gap-2">
                    <Btn size="sm" color="info" onClick={() => handleEdit(item)} icon="edit">
                      編輯
                    </Btn>
                    <Btn size="sm" color="danger" onClick={() => handleDelete(item.id)} icon="delete">
                      刪除
                    </Btn>
                  </div>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={4} className="text-center">
                目前沒有資料
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>
    </div>
  );
}
