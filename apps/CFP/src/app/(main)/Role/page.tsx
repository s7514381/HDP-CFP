'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { SearchBlock } from "@/components/layouts/SearchBlock";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import Container from "@packages/components/bootstrap5/Container";
import Grid from "@packages/components/bootstrap5/Grid";
import FontAwesome from "@packages/components/FontAwsome";
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { API_URL, API_MAP } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';

export default function AdminFunctionPage() {
  const router = useRouter();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission } = usePagePermissions();
  const { Row, Col } = Grid;

  const tableRef = React.useRef<CommonTableHandle>(null);
  const [searchName, setSearchName] = useState('');
  const [searchCode, setSearchCode] = useState('');

  const handleSearch = () => {
    tableRef.current?.search({
      Name: searchName,
      Code: searchCode
    });
  };

  const handleClear = () => {
    setSearchName('');
    setSearchCode('');
    tableRef.current?.search({});
  };

  const handleDelete = async (id: number | string) => {
    if (await confirm('確定要刪除此功能嗎？')) {
      try {
        await fetch(`${API_URL}/Role/Delete?id=${id}`, { method: 'POST' });
        success({ message: <span>刪除成功！</span> });
        tableRef.current?.reload();
      } catch (err) {
        danger({ message: <span>刪除失敗。</span> });
      }
    }
  };

  const columns: Column<any>[] = [
    {
      header: "項次",
      className: "text-center",
      style: { width: '80px' },
      render: (_, index) => index + 1
    },
    { 
      header: "角色名稱", 
      key: "name" 
    },
    { 
      header: "功能名稱", 
      key: "adminMenuName" 
    },
    {
      header: "操作",
      className: "text-center",
      style: { width: '120px' },
      render: (item) => (
        <div className="d-flex justify-content-center gap-2">
          {hasPermission('Edit') && (
            <FontAwesome 
              icon="fa-regular fa-pen-to-square" 
              className="text-warning cursor-pointer" 
              onClick={() => router.push(`/Role/Edit/?id=${item.id}`)}
            />
          )}
          {hasPermission('Delete') && (
            <FontAwesome 
              icon="fa-regular fa-trash-can" 
              className="text-danger cursor-pointer" 
              onClick={() => handleDelete(item.id)}
            />
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <ActionBar title="功能管理">
      </ActionBar>

      <WrapContent className="p-3">
        {/* <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={4}>
              <Input label="功能名稱" placeholder="功能名稱" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </Col>
            <Col md={4}>
              <Input label="功能代碼" placeholder="功能代碼" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
            </Col>
            <Col md={4} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                查詢
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>清除</Btn>
            </Col>
          </Row>
        </SearchBlock> */}

        <Container fluid className="mb-3">
            <div className="d-flex justify-content-end gap-2">
                <Btn color="success" icon="add" outline={false} onClick={() => router.push('/Role/Create')}>新增</Btn>
            </div>
        </Container>

        <Container fluid>
            <CommonTable 
              ref={tableRef}
              columns={columns}
              apiUrl={`${API_URL}/Role/GetList`}
              pageSize={10}
            />
        </Container>
      </WrapContent>
    </>
  );
}
