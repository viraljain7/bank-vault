import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import { PageHeader } from '../components/ui/PageHeader';
import { DetailSkeleton } from '../components/ui/Skeletons';
import { BankForm, type BankPayloadInput } from '../components/vault/BankForm';
import { useVaultItem, useVaultMutations } from '../hooks/useVaultQueries';
import { useVault } from '../contexts/VaultContext';
import { useDecrypt } from '../hooks/useDecrypt';
import { useToast } from '../contexts/ToastContext';
import { toApiError } from '../lib/api';
import { encryptBankItem } from '../lib/vaultService';
import type { BankPayload } from '../types';

export function BankFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { phase } = useVault();
  const { toast } = useToast();
  const enabled = phase === 'unlocked';

  const { data: item, isLoading, isFetched } = useVaultItem(id, enabled && mode === 'edit');
  const decrypted = useDecrypt(mode === 'edit' ? item : null) as BankPayload | null;
  const mutations = useVaultMutations(enabled);
  const [busy, setBusy] = useState(false);

  const editing = mode === 'edit';

  const isBeingLoaded = editing && (isLoading || (!isFetched && enabled) || !decrypted);

  useEffect(() => {
    if (editing && isFetched && !isLoading && !item) {
      toast('Credential not found.', { tone: 'error' });
      navigate('/banks');
    }
  }, [editing, isFetched, isLoading, item, navigate, toast]);

  const submit = async (payload: BankPayloadInput) => {
    setBusy(true);
    try {
      const encrypted = await encryptBankItem(payload as BankPayload, item?.favorite ?? false);
      if (editing && id) {
        await mutations.update.mutateAsync({ id, input: encrypted });
        toast('Bank account saved securely');
        navigate(`/banks/${id}`);
      } else {
        const created = await mutations.create.mutateAsync(encrypted);
        toast('Bank account saved securely');
        navigate(`/banks/${created._id}`);
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
        <PageHeader title={editing ? 'Edit Bank Account' : 'Add Bank Account'} />
        <DetailSkeleton />
      </Box>
    );
  }

  return (
    <Box className="fade-in" >
      <PageHeader
        title={editing ? 'Edit Bank Account' : 'Add Bank Account'}
        subtitle={editing ? 'Update the encrypted credentials below' : 'Securely stored with end-to-end encryption'}
      />
      <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3 }}>
        <BankForm
          defaultValues={
            editing
              ? decrypted
                ? {
                    bankName: decrypted.bankName,
                    nickname: decrypted.nickname,
                    accountNumber: decrypted.accountNumber,
                    customerId: decrypted.customerId,
                    netbankingUsername: decrypted.netbankingUsername,
                    netbankingPassword: decrypted.netbankingPassword,
                    profilePassword: decrypted.profilePassword,
                    notes: decrypted.notes,
                  }
                : undefined
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