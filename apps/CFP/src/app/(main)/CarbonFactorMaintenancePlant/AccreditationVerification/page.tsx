'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@packages/components/bootstrap5/Card';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import { Btn } from '@packages/components/bootstrap5/Btn';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useToast } from '@packages/contexts/ToastContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { API_MAP } from '@/lib/apiRoutes';
import MaterialDemandReservationModal from './MaterialDemandReservationModal';
import downloadFile from '@packages/lib/downloadFlie';
import {
  AccreditationVerificationPageModel,
  getAccreditationVerificationModel,
} from '../accreditationVerificationService';

export default function AccreditationVerificationPage() {
  return (
    <Suspense fallback={null}>
      <AccreditationVerificationContent />
    </Suspense>
  );
}

function AccreditationVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plantId = searchParams.get('id')?.trim() || '';
  const { formPost, get } = useAppApi();
  const { translate, languageCode } = useLanguage();
  const { hasPermission, isReady } = usePagePermissions('/DataMaintenance');
  const { success, danger } = useToast();
  const canAccess = hasPermission('BuyerAccreditationLevel:Index');
  const [model, setModel] = useState<AccreditationVerificationPageModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationType, setReservationType] = useState<'0' | '1' | null>(null);
  const [agreeingDemandId, setAgreeingDemandId] = useState<string | null>(null);

  const loadModel = useCallback(async () => {
    if (!plantId) {
      router.replace('/CarbonFactorMaintenancePlant/');
      return;
    }

    setLoading(true);
    setError(null);
    setModel(null);
    try {
      const result = await getAccreditationVerificationModel(formPost, plantId);
      if (!result.success || !result.data) {
        setError(result.message || translate(LANGUAGE_KEYS.carbonFactorMaintenance.loadFailed));
        return;
      }
      setModel({ ...result.data, consultantDemands: result.data.consultantDemands ?? [] });
    } catch {
      setError(translate(LANGUAGE_KEYS.carbonFactorMaintenance.loadFailed));
    } finally {
      setLoading(false);
    }
  }, [formPost, plantId, router, translate]);

  useEffect(() => {
    if (!isReady) return;
    if (!canAccess) {
      router.replace('/CarbonFactorMaintenancePlant/');
      return;
    }
    void loadModel();
  }, [canAccess, isReady, loadModel, router]);

  const downloadThirdPartyReport = async () => {
    if (!model?.thirdPartyReport) return;

    const result = await get<Blob>(
      `${API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_DOWNLOAD_ATTACHMENT}?id=${encodeURIComponent(model.thirdPartyReport.uploadFileId)}`,
      { responseType: 'blob' },
    );
    if (!result.success || !(result.data instanceof Blob)) {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.carbonFactorMaintenance.loadFailed)}</span> });
      return;
    }

    downloadFile({ blob: result.data, defaultFileName: model.thirdPartyReport.originalFileName });
  };

  const sellerAgree = async (demandId: string) => {
    if (agreeingDemandId) return;
    setAgreeingDemandId(demandId);
    try {
      const result = await formPost<boolean>(API_MAP.MATERIAL_DEMAND_SELLER_AGREE, { id: demandId });
      if (!result.success) {
        danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.materialDemand.operationFailed)}</span> });
        return;
      }
      success({ message: <span>{result.message || translate(LANGUAGE_KEYS.materialDemand.sellerAgreeSucceeded)}</span> });
      await loadModel();
    } catch {
      danger({ message: <span>{translate(LANGUAGE_KEYS.materialDemand.operationFailed)}</span> });
    } finally {
      setAgreeingDemandId(null);
    }
  };

  const title = translate(LANGUAGE_KEYS.dataQualityManagement.accreditationVerification);

  return (
    <>
      <ActionBar title={title}>
        <div className="d-flex ms-auto gap-2">
          <Btn type="button" color="primary" outline onClick={() => setReservationType('0')}>
            {translate(LANGUAGE_KEYS.materialDemand.reserveAccreditation)}
          </Btn>
          <Btn type="button" color="success" outline onClick={() => setReservationType('1')}>
            {translate(LANGUAGE_KEYS.materialDemand.reserveGuidance)}
          </Btn>
          <Btn type="button" color="secondary" outline onClick={() => router.push('/CarbonFactorMaintenancePlant/')}>
            {translate(LANGUAGE_KEYS.common.backToList)}
          </Btn>
        </div>
      </ActionBar>

      <WrapContent className="p-3">
        <Container fluid>
          {!isReady || loading ? (
            <div className="p-5 text-center">{translate(LANGUAGE_KEYS.common.loadingData)}</div>
          ) : !canAccess ? null : error ? (
            <div className="alert alert-danger" role="alert">{error}</div>
          ) : model ? (
            <>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Body>
                  <Grid.Row className="g-3">
                    <Grid.Col md={4}>
                      <div className="small text-muted">{translate(LANGUAGE_KEYS.dataQualityManagement.year)}</div>
                      <div className="fs-4 fw-semibold">{model.year}</div>
                    </Grid.Col>
                    <Grid.Col md={4}>
                      <div className="small text-muted">{translate(LANGUAGE_KEYS.carbonFactorMaintenance.plantName)}</div>
                      <div className="fs-4 fw-semibold">{model.plantName || '-'}</div>
                    </Grid.Col>
                    <Grid.Col md={4}>
                      <div className="small text-muted">{translate(LANGUAGE_KEYS.common.productName)}</div>
                      <div className="fw-semibold">{model.productName || '-'}</div>
                      <div className="small text-muted">{model.materialNumber || '-'}</div>
                    </Grid.Col>
                  </Grid.Row>
                </Card.Body>
              </Card>

              <Card className="border shadow-sm mb-3">
                <Card.Header>{translate(LANGUAGE_KEYS.buyerAccreditation.thirdPartyCertification)}</Card.Header>
                <Card.Body>
                  <Grid.Row className="g-3">
                    <Grid.Col md={4}>
                      <div className="small text-muted">{translate(LANGUAGE_KEYS.carbonFactorMaintenance.certificationYear)}</div>
                      <div className="fw-semibold">{model.thirdPartyCertificationYear ?? '-'}</div>
                    </Grid.Col>
                    <Grid.Col md={8}>
                      <div className="small text-muted">{translate(LANGUAGE_KEYS.carbonFactorMaintenance.thirdPartyReport)}</div>
                      {model.thirdPartyReport ? (
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          <span className="text-break">{model.thirdPartyReport.originalFileName}</span>
                          <Btn type="button" color="info" size="sm" outline onClick={() => void downloadThirdPartyReport()}>
                            {translate(LANGUAGE_KEYS.carbonFactorMaintenance.downloadFile)}
                          </Btn>
                        </div>
                      ) : (
                        <div className="fw-semibold">-</div>
                      )}
                    </Grid.Col>
                  </Grid.Row>
                </Card.Body>
              </Card>

              <Card className="border shadow-sm mb-3">
                <Card.Header>買方認可</Card.Header>
                <Card.Body>
                  {model.buyerAccreditations.length === 0 ? (
                    <div className="text-center text-muted py-4">{translate(LANGUAGE_KEYS.common.noData)}</div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {model.buyerAccreditations.map((buyer) => (
                        <div key={buyer.sourceId}>
                          <Grid.Row className="g-3">
                            <Grid.Col md={4}>
                              <div className="small text-muted">買方</div>
                              <div className="fw-semibold">{buyer.buyerName || '-'}</div>
                              <div className="small text-muted">{buyer.buyerMaterialNumber || '-'} · {buyer.buyerProductName || '-'}</div>
                            </Grid.Col>
                            <Grid.Col md={8}>
                              <div className="small text-muted">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.opinion)}</div>
                              {buyer.opinions.length === 0 ? (
                                <div className="text-muted">{translate(LANGUAGE_KEYS.materialMaintenanceOpinion.noOpinions)}</div>
                              ) : (
                                <div className="d-flex flex-column gap-2">
                                  {buyer.opinions.map((opinion) => (
                                    <div key={opinion.id} className="border-start border-3 ps-3">
                                      <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{opinion.content}</div>
                                      <div className="small text-muted mt-1">
                                        {opinion.createUserName || '-'} · {formatDate(opinion.createDate, languageCode)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </Grid.Col>
                          </Grid.Row>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>

              <Card className="border shadow-sm mb-3">
                <Card.Header>{translate(LANGUAGE_KEYS.materialDemand.accredit)}</Card.Header>
                <Card.Body>
                  {model.consultantDemands.length === 0 ? (
                    <div className="text-center text-muted py-4">{translate(LANGUAGE_KEYS.common.noData)}</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-bordered align-middle mb-0">
                        <thead>
                          <tr>
                            <th>{translate(LANGUAGE_KEYS.materialDemand.consultant)}</th>
                            <th>{translate(LANGUAGE_KEYS.materialDemand.demandStatus)}</th>
                            <th>{translate(LANGUAGE_KEYS.materialDemand.accreditationDemand)}</th>
                            <th>{translate(LANGUAGE_KEYS.materialDemand.demandPrice)}</th>
                            <th>{translate(LANGUAGE_KEYS.materialDemand.consultantResponsePrice)}</th>
                            <th>{translate(LANGUAGE_KEYS.materialDemand.urgency)}</th>
                            <th>{translate(LANGUAGE_KEYS.common.actions)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {model.consultantDemands.map((demand) => {
                            const status = String(demand.demandStatus);
                            const isBusy = agreeingDemandId === demand.id;
                            return (
                              <tr key={demand.id}>
                                <td>{demand.consultantName || '-'}</td>
                                <td>{translate(statusLanguageKey(status))}</td>
                                <td>{String(demand.demandType) === '1' ? translate(LANGUAGE_KEYS.materialDemand.guidanceDemand) : translate(LANGUAGE_KEYS.materialDemand.accreditationDemand)}</td>
                                <td className="text-end">{demand.demandPrice ?? '-'}</td>
                                <td className="text-end">{demand.consultantResponsePrice ?? '-'}</td>
                                <td>{demand.isUrgent === true || demand.isUrgent === 1 || String(demand.isUrgent).toLowerCase() === 'true' ? translate(LANGUAGE_KEYS.materialDemand.urgent) : translate(LANGUAGE_KEYS.materialDemand.normal)}</td>
                                <td>
                                  <Btn type="button" color="primary" size="sm" outline disabled={status !== '1' || isBusy} loading={isBusy} onClick={() => void sellerAgree(demand.id)}>
                                    {translate(LANGUAGE_KEYS.materialDemand.sellerAgree)}
                                  </Btn>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card.Body>
              </Card>

              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Card className="border shadow-sm h-100">
                    <Card.Header>{translate(LANGUAGE_KEYS.buyerAccreditation.consultantApprovalCount)}</Card.Header>
                    <Card.Body><span className="fw-semibold">-</span></Card.Body>
                  </Card>
                </Grid.Col>
                <Grid.Col md={6}>
                  <Card className="border shadow-sm h-100">
                    <Card.Header>{translate(LANGUAGE_KEYS.buyerAccreditation.totalScore)}</Card.Header>
                    <Card.Body><span className="fw-semibold">-</span></Card.Body>
                  </Card>
                </Grid.Col>
              </Grid.Row>
            </>
          ) : null}
        </Container>
      </WrapContent>

      {reservationType && (
        <MaterialDemandReservationModal
          show
          plantId={plantId}
          demandType={reservationType}
          onClose={() => setReservationType(null)}
          onSuccess={() => setReservationType(null)}
        />
      )}
    </>
  );
}

function formatDate(value: string | null, languageCode: string): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(languageCode);
}

function statusLanguageKey(status: string): string {
  return ({ '0': LANGUAGE_KEYS.materialDemand.waiting, '1': LANGUAGE_KEYS.materialDemand.consultantReplied, '2': LANGUAGE_KEYS.materialDemand.sellerReplied, '3': LANGUAGE_KEYS.materialDemand.accredited } as Record<string, string>)[status] || LANGUAGE_KEYS.materialDemand.demandStatus;
}
