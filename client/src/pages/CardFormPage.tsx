import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import { PageHeader } from '../components/ui/PageHeader';
import { DetailSkeleton } from '../components/ui/Skeletons';
import { CardForm } from '../components/vault/CardForm';
import { useVaultItem, useVaultMutations } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { useDecrypt } from '../hooks/useDecrypt';
import { useToast } from '../contexts/ToastContext';
import { toApiError } from '../lib/api';
import { encryptCardItem } from '../lib/vaultService';
import type { CardPayload } from '../types';

export function CardFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { phase } = useVault();
  const { toast } = useToast();
  const enabled = phase === 'unlocked';

  const { data: item, isLoading, isFetched } = useVaultItem(id, enabled && mode === 'edit');
  const decrypted = useDecrypt(mode === 'edit' ? item : null) as CardPayload | null;
  const mutations = useVaultMutations(enabled);
  const [busy, setBusy] = useState(false);

  const editing = mode === 'edit';
  const isBeingLoaded = editing && (isLoading || (!isFetched && enabled) || !decrypted);

  useEffect(() => {
    if (editing && isFetched && !isLoading && !item) {
      toast('Credential not found.', { tone: 'error' });
      navigate('/cards');
    }
  }, [editing, isFetched, isLoading, item, navigate, toast]);

  const submit = async (payload: CardPayload) => {
    setBusy(true);
    try {
      const encrypted = await encryptCardItem(payload, item?.favorite ?? false);
      if (editing && id) {
        await mutations.update.mutateAsync({ id, input: encrypted });
        toast('Card saved securely');
        navigate(`/cards/${id}`);
      } else {
        const created = await mutations.create.mutateAsync(encrypted);
        toast('Card saved securely');
        navigate(`/cards/${created._id}`);
      }
    } catch (err) {
      toast(toApiError(err).message, { tone: 'error', title: 'Unable to save credential.' });
    } finally {
      setBusy(false);
    }
  };

  if (isBeingLoaded) {
    return (
      <Box >
        <PageHeader title={editing ? 'Edit Card' : 'Add Card'} />
        <DetailSkeleton />
      </Box>
    );
  }

  return (
    <Box className="fade-in" >
      <PageHeader
        title={editing ? 'Edit Card' : 'Add Card'}
        subtitle={editing ? 'Update the encrypted card details below' : 'CVV stored encrypted end-to-end'}
      />
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3 }}>
        <CardForm
          defaultValues={
            editing && decrypted
              ? {
                  cardNickname: decrypted.cardNickname,
                  cardholderName: decrypted.cardholderName,
                  cardNumber: decrypted.cardNumber,
                  expiryMonth: decrypted.expiryMonth,
                  expiryYear: decrypted.expiryYear,
                  cardBrand: decrypted.cardBrand as typeof import('../schemas/vaultSchemas').CARD_BRANDS[number],
                  notes: decrypted.notes,
                }
              : undefined
          }
          onSubmit={(data) => submit(data)}
          busy={busy}
          onCancel={() => navigate('-1')}
        />
      </Paper>
    </Box>
  );
}