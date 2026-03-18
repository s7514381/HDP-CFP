import React, { RefObject } from "react";
import Container from "../bootstrap5/Container";
import Form, { FormRef } from "../bootstrap5/Form";
import Grid from "../bootstrap5/Grid";
import { Input } from "../bootstrap5/Input";
import { Btn } from "../bootstrap5/Btn";
import Select from "../bootstrap5/Select";

/** 
 * 搜尋表單型別
 * @returns
 * */
export interface FormData {
  status: string | number;
  keyword: string;
  begin: string;
  end: string;
}
/** 搜尋表單預設資料 */
export const initData = {
  status: "",
  keyword: "",
  begin: "",
  end: "",
};

/** 搜尋表單屬性型別 */
interface FormProps {
  formRef?: RefObject<FormRef<FormData> | null>;
  statusItems: { value: string | number; label: string }[];
  onSearch: (data: FormData) => void;
  onCancel: () => void;
}

/**
 * 通用的關鍵字搜尋表單元件
 * 狀態欄位 + 關鍵字欄位 + 日期區間欄位 + 搜尋按鈕 + 取消按鈕
 */
export const KeywordSearchForm = ({
  formRef,
  statusItems,
  onSearch,
  onCancel,
}: FormProps) => {
  const handleSubmit = (data: FormData) => {
    onSearch?.(data);
  };

  const handleCancel = () => {
    formRef?.current?.resetForm();
    onCancel?.();
  };

  return (
    <Container fluid className="p-0 mb-3">
      <Form<FormData> ref={formRef} initialValues={initData} onSubmit={handleSubmit} className="row align-items-end">
        <Grid.Col col={`auto`}>
          <Select name="status" options={statusItems} label={`狀態`} />
        </Grid.Col>
        <Grid.Col col={`auto`}>
          <Input bsSize="sm" type="date" name="begin" label="開始日期" />
        </Grid.Col>
        <Grid.Col col={`auto`}>
          <Input bsSize="sm" type="date" name="end" label="結束日期" />
        </Grid.Col>
        <Grid.Col col>
          <Input bsSize="sm" name="keyword" label="關鍵字" placeholder="輸入關鍵字"/>
        </Grid.Col>
        <Grid.Col col={`auto`}>
          <Btn icon="search" type="submit" size="sm" color="primary">搜尋</Btn>
          <Btn icon="cancel" type="button" size="sm" color="secondary" className="ms-2" onClick={handleCancel}>取消</Btn>
        </Grid.Col>
      </Form>
    </Container>
  );
};

export default KeywordSearchForm;
