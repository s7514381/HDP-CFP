'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@packages/components/bootstrap5/Card';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { FileBtn, Input, Textarea } from '@packages/components/bootstrap5/Input';
import Modal from '@packages/components/bootstrap5/Modal';
import FormActionBar from '@/components/common/FormActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@packages/contexts/ToastContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { API_MAP } from '@/lib/apiRoutes';
import downloadFile from '@packages/lib/downloadFlie';
import { FormContentProps } from '@/components/common/formTypes';
import {
  CarbonFactorMaintenanceAttachment,
  CarbonFactorMaintenancePcrEvidenceCategory,
  CarbonFactorMaintenancePcrEvidenceItem,
  PcrTemplateCategory,
} from '../carbonFactorMaintenanceService';

export interface EvidenceUploadDraft {
  pcrPatternId: string;
  file: File;
}

export interface PlantFormData {
  id?: string;
  materialId: string;
  buyerMaterialId: string;
  yearId: string;
  materialNumber: string;
  productName: string;
  buyerName: string;
  buyerMaterialNumber: string;
  year: string;
  productUnit: string;
  plantName: string;
  allocationPercentage: string;
  carbonFactor: string;
  thirdPartyCertificationYear: string;
  thirdPartyReport: File | null;
  selfSummaryReport: File | null;
  attachments: CarbonFactorMaintenanceAttachment[];
  pcrEvidenceCategories: CarbonFactorMaintenancePcrEvidenceCategory[];
  evidenceUploads: EvidenceUploadDraft[];
  removeEvidencePcrPatternIds: string[];
  removeThirdPartyReport: boolean;
  removeSelfSummaryReport: boolean;
}

export const createEmptyPlantFormData = (context: Partial<PlantFormData> = {}): PlantFormData => ({
  materialId: '',
  buyerMaterialId: '',
  yearId: '',
  materialNumber: '',
  productName: '',
  buyerName: '',
  buyerMaterialNumber: '',
  year: '',
  productUnit: '',
  plantName: '',
  allocationPercentage: '',
  carbonFactor: '',
  thirdPartyCertificationYear: String(new Date().getFullYear()),
  thirdPartyReport: null,
  selfSummaryReport: null,
  attachments: [],
  pcrEvidenceCategories: [],
  evidenceUploads: [],
  removeEvidencePcrPatternIds: [],
  removeThirdPartyReport: false,
  removeSelfSummaryReport: false,
  ...context,
});

const ACCEPTED_FILES = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
const FORM_ID = 'carbon-factor-maintenance-plant-form';
const CATEGORY_NAMES: Record<PcrTemplateCategory, string> = {
  0: '原料',
  1: '製程',
  2: '運輸',
  3: '廢棄',
};

async function isValidXlsxFile(file: File): Promise<boolean> {
  if (!file.name.toLowerCase().endsWith('.xlsx')) return true;

  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  return header.length === 4
    && header[0] === 0x50
    && header[1] === 0x4B
    && header[2] === 0x03
    && header[3] === 0x04;
}

type AttachmentField = 'thirdPartyReport' | 'selfSummaryReport';
type RemoveField = 'removeThirdPartyReport' | 'removeSelfSummaryReport';

const attachmentDefinitions: Array<{
  type: 'ThirdPartyReport' | 'SelfSummaryReport';
  fileField: AttachmentField;
  removeField: RemoveField;
  labelKey: string;
  fallback: string;
}> = [
  { type: 'ThirdPartyReport', fileField: 'thirdPartyReport', removeField: 'removeThirdPartyReport', labelKey: LANGUAGE_KEYS.carbonFactorMaintenance.thirdPartyReport, fallback: '第三方查證報告' },
  { type: 'SelfSummaryReport', fileField: 'selfSummaryReport', removeField: 'removeSelfSummaryReport', labelKey: LANGUAGE_KEYS.carbonFactorMaintenance.selfSummaryReport, fallback: '自我總結報告' },
];

function getAttachmentByType(attachments: CarbonFactorMaintenanceAttachment[], type: string) {
  return attachments.find((attachment) => attachment.attachmentType === type);
}

function getCategoryItems(formData: PlantFormData, category: PcrTemplateCategory) {
  return formData.pcrEvidenceCategories.find((group) => group.category === category)?.items || [];
}

function hasVisibleAttachment(formData: PlantFormData, item: CarbonFactorMaintenancePcrEvidenceItem) {
  return formData.evidenceUploads.some((upload) => upload.pcrPatternId === item.pcrPatternId)
    || (!!item.attachment && !formData.removeEvidencePcrPatternIds.includes(item.pcrPatternId));
}

export interface PlantContentProps extends FormContentProps<PlantFormData> {
  allowFileUpload?: boolean;
  allowOpinionEdit?: boolean;
  returnPath?: string;
}

export default function PlantContent({
  title,
  formData,
  onChange,
  updateForm,
  onSubmit,
  loading,
  submitLabel,
  allowFileUpload = true,
  allowOpinionEdit = false,
  returnPath,
}: PlantContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { get, formPost } = useAppApi();
  const { translate } = useLanguage();
  const { danger, success } = useToast();
  const currentYear = new Date().getFullYear();
  const minCertificationYear = currentYear - 2;
  const readOnly = searchParams.get('readonly') === 'true' || searchParams.get('readonly') === '1';
  const canManageAttachments = !readOnly && allowFileUpload;
  const [activeCategory, setActiveCategory] = useState<PcrTemplateCategory>(0);
  const [opinionAttachment, setOpinionAttachment] = useState<CarbonFactorMaintenanceAttachment | null>(null);
  const [opinionDraft, setOpinionDraft] = useState('');
  const [opinionError, setOpinionError] = useState<string | null>(null);
  const [opinionSubmitting, setOpinionSubmitting] = useState(false);
  const label = (key: string, fallback: string) => translate(key) || fallback;
  const defaultReturnUrl = useMemo(() => {
    const params = new URLSearchParams();
    ['materialId', 'buyerMaterialId', 'yearId'].forEach((name) => {
      const value = formData[name as keyof PlantFormData];
      if (typeof value === 'string' && value) params.set(name, value);
    });
    return `/DataMaintenance/CarbonFactorMaintenance/?${params.toString()}`;
  }, [formData]);
  const returnUrl = returnPath || defaultReturnUrl;

  const activeItems = getCategoryItems(formData, activeCategory);
  const completedCount = activeItems.filter((item) => hasVisibleAttachment(formData, item)).length;
  const allPatternItems = formData.pcrEvidenceCategories.flatMap((group) => group.items);
  const incompletePatternCount = allPatternItems.filter((item) => !hasVisibleAttachment(formData, item)).length;

  const handleFormSubmit = (event: React.FormEvent) => {
    if (readOnly) {
      event.preventDefault();
      return;
    }
    if (incompletePatternCount > 0) {
      danger({ message: <span>尚有 {incompletePatternCount} 筆 PCR 主項目未上傳，仍可先儲存並稍後補件。</span> });
    }
    onSubmit(event);
  };

  const downloadAttachment = async (attachment: CarbonFactorMaintenanceAttachment) => {
    const result = await get<Blob>(`${API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_DOWNLOAD_ATTACHMENT}?id=${encodeURIComponent(attachment.uploadFileId)}`, { responseType: 'blob' });
    if (!result.success || !(result.data instanceof Blob)) {
      danger({ message: <span>{result.message || label(LANGUAGE_KEYS.common.loadFailed, '下載失敗')}</span> });
      return;
    }
    downloadFile({ blob: result.data, defaultFileName: attachment.originalFileName });
  };

  const updateEvidenceDraft = (pcrPatternId: string, file: File) => {
    const nextUploads = formData.evidenceUploads.filter((upload) => upload.pcrPatternId !== pcrPatternId);
    updateForm({
      evidenceUploads: [...nextUploads, { pcrPatternId, file }],
      removeEvidencePcrPatternIds: formData.removeEvidencePcrPatternIds.filter((id) => id !== pcrPatternId),
    });
  };

  const removeEvidence = (item: CarbonFactorMaintenancePcrEvidenceItem) => {
    const nextUploads = formData.evidenceUploads.filter((upload) => upload.pcrPatternId !== item.pcrPatternId);
    const hasExisting = Boolean(item.attachment);
    const nextRemoved = hasExisting && !formData.removeEvidencePcrPatternIds.includes(item.pcrPatternId)
      ? [...formData.removeEvidencePcrPatternIds, item.pcrPatternId]
      : formData.removeEvidencePcrPatternIds;
    updateForm({ evidenceUploads: nextUploads, removeEvidencePcrPatternIds: nextRemoved });
  };

  const assignBatchFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const invalidFiles: string[] = [];
    for (const file of files) {
      if (!await isValidXlsxFile(file)) invalidFiles.push(file.name);
    }
    if (invalidFiles.length > 0) {
      event.target.value = '';
      danger({ message: <span>以下檔案不是有效的 XLSX 檔案：{invalidFiles.join('、')}</span> });
      return;
    }

    const availableItems = activeItems.filter((item) => !hasVisibleAttachment(formData, item));
    if (files.length > availableItems.length) {
      danger({ message: <span>本分類最多只能配對 {availableItems.length} 個未完成主項目，請減少檔案數量。</span> });
      return;
    }

    const drafts = files.map((file, index) => ({ pcrPatternId: availableItems[index].pcrPatternId, file }));
    updateForm({ evidenceUploads: [...formData.evidenceUploads, ...drafts] });
  };

  const reassignDraft = (file: File, currentPatternId: string, nextPatternId: string) => {
    if (currentPatternId === nextPatternId) return;

    const targetUpload = formData.evidenceUploads.find((upload) => upload.pcrPatternId === nextPatternId);
    if (targetUpload) {
      updateForm({
        evidenceUploads: formData.evidenceUploads.map((upload) => {
          if (upload.pcrPatternId === currentPatternId) return { pcrPatternId: nextPatternId, file: file };
          if (upload.pcrPatternId === nextPatternId) return { pcrPatternId: currentPatternId, file: targetUpload.file };
          return upload;
        }),
        removeEvidencePcrPatternIds: formData.removeEvidencePcrPatternIds.filter((id) => id !== currentPatternId && id !== nextPatternId),
      });
      return;
    }

    updateForm({
      evidenceUploads: formData.evidenceUploads.map((upload) => upload.pcrPatternId === currentPatternId
        ? { pcrPatternId: nextPatternId, file }
        : upload),
      removeEvidencePcrPatternIds: formData.removeEvidencePcrPatternIds.filter((id) => id !== nextPatternId),
    });
  };

  const openOpinionModal = (attachment: CarbonFactorMaintenanceAttachment) => {
    setOpinionAttachment(attachment);
    setOpinionDraft(attachment.opinion || '');
    setOpinionError(null);
  };

  const closeOpinionModal = () => {
    if (opinionSubmitting) return;
    setOpinionAttachment(null);
    setOpinionDraft('');
    setOpinionError(null);
  };

  const saveOpinion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!opinionAttachment) return;

    setOpinionSubmitting(true);
    setOpinionError(null);
    try {
      const result = await formPost(API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_UPDATE_OPINION, {
        uploadFileId: opinionAttachment.uploadFileId,
        opinion: opinionDraft,
      });
      if (!result.success) {
        setOpinionError(result.message || '建議儲存失敗');
        return;
      }

      const opinion = opinionDraft.trim();
      updateForm({
        attachments: formData.attachments.map((attachment) => attachment.uploadFileId === opinionAttachment.uploadFileId
          ? { ...attachment, opinion }
          : attachment),
        pcrEvidenceCategories: formData.pcrEvidenceCategories.map((group) => ({
          ...group,
          items: group.items.map((item) => item.attachment?.uploadFileId === opinionAttachment.uploadFileId
            ? { ...item, attachment: { ...item.attachment, opinion } }
            : item),
        })),
      });
      setOpinionAttachment((attachment) => attachment ? { ...attachment, opinion } : attachment);
      success({ message: <span>建議已儲存</span> });
      setOpinionSubmitting(false);
      closeOpinionModal();
    } catch (error) {
      setOpinionError(error instanceof Error && error.message ? error.message : '建議儲存失敗');
    } finally {
      setOpinionSubmitting(false);
    }
  };

  const canViewOpinion = (attachment: CarbonFactorMaintenanceAttachment) =>
    allowOpinionEdit || Boolean(attachment.opinion?.trim());

  return (
    <>
      <FormActionBar title={title} formId={FORM_ID} submitLabel={submitLabel} loading={loading} showSubmit={!readOnly} backLabel={LANGUAGE_KEYS.common.backToList} onBack={() => router.push(returnUrl)} />
      <WrapContent className="p-3">
        <Container fluid>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Header>{label(LANGUAGE_KEYS.carbonFactorMaintenance.currentFile, '產品／買方／年度摘要')}</Card.Header>
            <Card.Body>
              <Grid.Row className="g-3">
                <Grid.Col md={4}><div className="small text-muted">產品</div><div className="fw-semibold">{formData.productName || '-'}</div><div className="small text-muted">{formData.materialNumber || '-'}</div></Grid.Col>
                <Grid.Col md={4}><div className="small text-muted">買方</div><div className="fw-semibold">{formData.buyerName || '-'}</div><div className="small text-muted">{formData.buyerMaterialNumber || '-'}</div></Grid.Col>
                <Grid.Col md={4}><div className="small text-muted">年度／產品單位</div><div className="fw-semibold">{formData.year || '-'}／{formData.productUnit || '-'}</div></Grid.Col>
              </Grid.Row>
            </Card.Body>
          </Card>

          <form id={FORM_ID} onSubmit={handleFormSubmit} encType="multipart/form-data">
            <Card className="border shadow-sm mb-3">
              <Card.Header>廠區基本資料</Card.Header>
              <Card.Body>
                <Grid.Row className="g-3">
                  <Grid.Col md={4}><Input name="plantName" label={label(LANGUAGE_KEYS.carbonFactorMaintenance.plantName, '廠區名稱')} value={formData.plantName} onChange={onChange} required disabled={readOnly} /></Grid.Col>
                  <Grid.Col md={4}><Input name="allocationPercentage" type="number" min={0.01} max={100} step="0.01" label={label(LANGUAGE_KEYS.carbonFactorMaintenance.allocation, '佔比（％）')} value={formData.allocationPercentage} onChange={onChange} required disabled={readOnly} /></Grid.Col>
                  <Grid.Col md={4}><Input name="carbonFactor" type="number" min={0} step="0.000001" label={label(LANGUAGE_KEYS.carbonFactorMaintenance.carbonFactor, '碳排係數')} value={formData.carbonFactor} onChange={onChange} required disabled={readOnly} /></Grid.Col>
                </Grid.Row>
              </Card.Body>
            </Card>

            <Card className="border shadow-sm mb-3">
              <Card.Header>{label(LANGUAGE_KEYS.carbonFactorMaintenance.certificationYear, '第三方查證資料')}</Card.Header>
              <Card.Body>
                <Grid.Row className="g-3">
                  <Grid.Col md={4}><Input name="thirdPartyCertificationYear" type="number" min={minCertificationYear} max={currentYear} label={label(LANGUAGE_KEYS.carbonFactorMaintenance.certificationYear, '第三方查證年份')} value={formData.thirdPartyCertificationYear} onChange={onChange} required disabled={readOnly} /></Grid.Col>
                </Grid.Row>
                <div className="small text-muted mt-2">{label(LANGUAGE_KEYS.carbonFactorMaintenance.fileHint, '可上傳 PDF、DOC／DOCX、XLS／XLSX、JPG／JPEG、PNG，每個檔案上限 5MB。')}</div>
                <div className="row g-3 mt-1">
                  {attachmentDefinitions.map((definition) => {
                    const existing = getAttachmentByType(formData.attachments, definition.type);
                    const selectedFile = formData[definition.fileField];
                    const isRemoved = formData[definition.removeField];
                    return (
                      <div className="col-12" key={definition.type}>
                        <div className="border rounded p-3 d-flex flex-wrap align-items-center gap-2">
                          <strong className="me-2">{label(definition.labelKey, definition.fallback)}</strong>
                          {canManageAttachments && <FileBtn label={selectedFile ? label(LANGUAGE_KEYS.carbonFactorMaintenance.replaceFile, '替換檔案') : label(LANGUAGE_KEYS.carbonFactorMaintenance.uploadFile, '上傳檔案')} accept={ACCEPTED_FILES} onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            if (!await isValidXlsxFile(file)) {
                              event.target.value = '';
                              danger({ message: <span>檔案內容不是有效的 XLSX 檔案：{file.name}</span> });
                              return;
                            }
                            updateForm({ [definition.fileField]: file, [definition.removeField]: false } as Partial<PlantFormData>);
                          }} />}
                          {existing && !isRemoved && !selectedFile && <><span className="text-break">{existing.originalFileName} <span className="text-muted small">({Math.ceil(existing.fileSize / 1024)} KB)</span></span><Btn type="button" color="info" size="sm" outline onClick={() => void downloadAttachment(existing)}>{label(LANGUAGE_KEYS.carbonFactorMaintenance.downloadFile, '下載')}</Btn></>}
                          {selectedFile && <span className="text-break">{selectedFile.name} <span className="text-muted small">({Math.ceil(selectedFile.size / 1024)} KB)</span></span>}
                          {canManageAttachments && (existing || selectedFile) && <Btn type="button" color="danger" size="sm" outline onClick={() => updateForm({ [definition.fileField]: null, [definition.removeField]: Boolean(existing) } as Partial<PlantFormData>)}>{label(LANGUAGE_KEYS.carbonFactorMaintenance.removeFile, '移除')}</Btn>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>

            <Card className="border shadow-sm mb-3">
              <Card.Header>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <span>佐證資料</span>
                  <span className="small text-muted">依 PCR 主項目上傳，細項不需上傳</span>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="nav nav-tabs mb-3" role="tablist" aria-label="PCR 佐證資料分類">
                  {[0, 1, 2, 3].map((category) => {
                    const typedCategory = category as PcrTemplateCategory;
                    const items = getCategoryItems(formData, typedCategory);
                    const count = items.filter((item) => hasVisibleAttachment(formData, item)).length;
                    const isComplete = items.length > 0 && count === items.length;
                    return <button key={category} type="button" className={`nav-link ${activeCategory === typedCategory ? 'active' : ''}`} onClick={() => setActiveCategory(typedCategory)}>{CATEGORY_NAMES[typedCategory]} <span className={`badge ms-1 ${items.length === 0 ? 'text-bg-secondary' : isComplete ? 'text-bg-success' : 'text-bg-warning'}`}>{count}/{items.length}</span></button>;
                  })}
                </div>

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <div><strong>{CATEGORY_NAMES[activeCategory]}</strong><span className="text-muted ms-2">已完成 {completedCount}/{activeItems.length}</span></div>
                  {canManageAttachments && activeItems.length > completedCount && <FileBtn label="依序上傳本分類檔案" accept={ACCEPTED_FILES} multiple onChange={assignBatchFiles} btnProps={{ color: 'primary', outline: false, size: 'sm', icon: 'upload' }} />}
                </div>

                {activeItems.length === 0 && <div className="text-center text-muted border rounded p-4">此分類目前沒有 PCR 主項目。</div>}
                {activeItems.length > 0 && <div className="list-group">
                  {activeItems.map((item, index) => {
                    const draft = formData.evidenceUploads.find((upload) => upload.pcrPatternId === item.pcrPatternId);
                    const attachment = item.attachment && !formData.removeEvidencePcrPatternIds.includes(item.pcrPatternId) ? item.attachment : null;
                    const displayFile = draft?.file;
                    return <div className="list-group-item" key={item.pcrPatternId}>
                      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3">
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{index + 1}. {item.item}</div>
                          {item.childItems.length > 0 && <div className="small text-muted mt-1">細項：{item.childItems.join('、')}</div>}
                          {attachment && !displayFile && <div className="small mt-2">目前檔案：{attachment.originalFileName} <span className="text-muted">({Math.ceil(attachment.fileSize / 1024)} KB)</span></div>}
                          {displayFile && <div className="small mt-2 text-primary">待上傳：{displayFile.name} <span className="text-muted">({Math.ceil(displayFile.size / 1024)} KB)</span></div>}
                          {!attachment && !displayFile && <div className="small text-warning mt-2">尚未上傳</div>}
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {canManageAttachments && <FileBtn label={attachment || displayFile ? '替換檔案' : '上傳檔案'} accept={ACCEPTED_FILES} onChange={(event) => { const file = event.target.files?.[0]; if (file) updateEvidenceDraft(item.pcrPatternId, file); }} btnProps={{ color: 'primary', outline: true, size: 'sm' }} />}
                          {attachment && <Btn type="button" color="info" size="sm" outline onClick={() => void downloadAttachment(attachment)}>下載</Btn>}
                          {attachment && canViewOpinion(attachment) && <Btn type="button" color="warning" size="sm" outline onClick={() => openOpinionModal(attachment)}>{allowOpinionEdit ? '建議' : '查看建議'}</Btn>}
                          {canManageAttachments && (attachment || displayFile) && <Btn type="button" color="danger" size="sm" outline onClick={() => removeEvidence(item)}>移除</Btn>}
                        </div>
                      </div>
                    </div>;
                  })}
                </div>}

                {canManageAttachments && formData.evidenceUploads.length > 0 && <div className="border rounded p-3 mt-3 bg-light">
                  <div className="fw-semibold mb-2">待上傳檔案配對預覽</div>
                  {formData.evidenceUploads.map((upload) => {
                    const sourceItem = allPatternItems.find((item) => item.pcrPatternId === upload.pcrPatternId);
                    const categoryItems = getCategoryItems(formData, sourceItem?.category ?? activeCategory);
                    return <div className="row align-items-center g-2 mb-2" key={`${upload.pcrPatternId}-${upload.file.name}`}>
                      <div className="col-md-5 text-break">{upload.file.name}</div>
                      <div className="col-md-6"><select className="form-select form-select-sm" value={upload.pcrPatternId} onChange={(event) => reassignDraft(upload.file, upload.pcrPatternId, event.target.value)} aria-label="選擇 PCR 主項目">{categoryItems.map((item) => <option key={item.pcrPatternId} value={item.pcrPatternId}>{item.item}</option>)}</select></div>
                      <div className="col-md-1 text-end"><Btn type="button" color="danger" size="sm" outline onClick={() => { const item = allPatternItems.find((candidate) => candidate.pcrPatternId === upload.pcrPatternId); if (item) removeEvidence(item); }}>移除</Btn></div>
                    </div>;
                  })}
                </div>}
              </Card.Body>
            </Card>
          </form>
        </Container>
      </WrapContent>
      <Modal show={opinionAttachment !== null} size="lg" onClose={closeOpinionModal}>
        <Modal.Title onClose={closeOpinionModal}>{allowOpinionEdit ? '編輯建議' : '查看建議'}</Modal.Title>
        <Modal.Body>
          <form onSubmit={saveOpinion}>
            <div className="small text-muted mb-2">{opinionAttachment?.originalFileName || ''}</div>
            <Textarea
              label="建議內容"
              value={opinionDraft}
              maxLength={4000}
              rows={6}
              error={opinionError ? [opinionError] : []}
              onChange={(event) => {
                setOpinionDraft(event.target.value);
                if (opinionError) setOpinionError(null);
              }}
              readOnly={!allowOpinionEdit}
              disabled={opinionSubmitting}
              autoFocus
            />
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Btn type="button" color="secondary" outline onClick={closeOpinionModal} disabled={opinionSubmitting}>{translate(LANGUAGE_KEYS.common.close)}</Btn>
              {allowOpinionEdit && <Btn type="submit" color="primary" loading={opinionSubmitting}>儲存</Btn>}
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

PlantContent.defaultData = createEmptyPlantFormData();
