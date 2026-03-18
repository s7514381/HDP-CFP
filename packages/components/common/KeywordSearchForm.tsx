import React, { RefObject } from "react";
import Container from "../bootstrap5/Container";
import Form, { FormRef } from "../bootstrap5/Form";
import Grid from "../bootstrap5/Grid";
import { Input } from "../bootstrap5/Input";
import { Btn } from "../bootstrap5/Btn";
import { StatusSelect } from "../bootstrap5/Select";

/** 搜尋表單型別 */
export interface KeywordSearchFormData {
  status: string;
  keyword: string;
}
/** 搜尋表單預設資料 */
const initData = {
  status: '',
  keyword: '',
};
/** 表單設定項目 */
interface FormSettings {
  // 是否提供狀態下拉選單欄位（0或1）
  statusColumn: boolean,
}

/** 搜尋表單屬性型別 */
interface KeywordSearchFormProps {
  formRef?: RefObject<FormRef<KeywordSearchFormData> | null>
  onSearch: (data: KeywordSearchFormData) => void;
  onCancel: () => void;
  setting?: FormSettings
}

/**
 * 通用的關鍵字搜尋表單元件
 * 狀態欄位 + 關鍵字欄位 + 搜尋按鈕 + 取消按鈕
 */
export const KeywordSearchForm = ({ 
  formRef,
  onSearch, 
  onCancel,
  setting = {
    statusColumn: true
  } as FormSettings
}: KeywordSearchFormProps) => {

  const handleSubmit = (data: KeywordSearchFormData) => {
    onSearch?.(data);
  };

  const handleCancel = () => {
    formRef?.current?.resetForm();
    onCancel?.();
  };

  return (
    <Container fluid className="p-0 mb-3">
      <Form<KeywordSearchFormData> ref={formRef} initialValues={initData} onSubmit={handleSubmit} className="row align-items-end">
        {
          setting.statusColumn &&
          <Grid.Col col={`auto`}>
            <StatusSelect name="status" label="狀態" bsSize="sm" />
          </Grid.Col>
        }
        <Grid.Col col>
          <Input bsSize="sm" name="keyword" label="關鍵字" placeholder="請輸入盤包編號或名稱" />
        </Grid.Col>
        <Grid.Col col={`auto`}>
          <Btn icon="search" type="submit" size="sm" color="primary">搜尋</Btn>
          <Btn icon="cancel" type="button" size="sm" color="secondary" className="ms-2" onClick={handleCancel}>取消</Btn>
        </Grid.Col>
      </Form>
    </Container>
)}

export default KeywordSearchForm;