import { Button, Dialog, Field, Input, Portal, Stack, Text } from '@chakra-ui/react';
import { memo, useState } from 'react';
import { useForm } from 'react-hook-form';

type FormValues = {
  detail: string;
  time: number;
};

type CommonProps = {
  inputKeyword: 'add' | 'edit';
};

type AddProps = {
  inputKeyword: 'add';
  onSubmitRegistration: (data: FormValues) => Promise<boolean>;
  record?: never;
  onClickEditRecord?: never;
};

type EditProps = {
  inputKeyword: 'edit';
  record: {
    id: string;
    title: string;
    time: number | null;
  };
  onClickEditRecord: (recordId: string, title: string, time: number) => Promise<boolean>;
  onSubmitRegistration?: never;
};

type InputFormProps = CommonProps & (AddProps | EditProps);

export const InputForm = memo((props: InputFormProps) => {
  const { record, inputKeyword, onSubmitRegistration, onClickEditRecord } = props;

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      detail: inputKeyword === 'edit' ? record?.title : '',
      time: inputKeyword === 'edit' ? record?.time ?? 0 : 0,
    },
  });

  const [open, setOpen] = useState(false);
  const detail = watch('detail');
  const time = watch('time');

  const onSubmit = async (data: FormValues) => {
    // 送信前にサーバーエラー表示をクリア
    clearErrors('root');

    try {
      let ok = false;
      if (inputKeyword === 'add') {
        ok = await onSubmitRegistration(data);
      } else if (inputKeyword === 'edit') {
        ok = await onClickEditRecord(record.id, data.detail, data.time);
      }

      if (ok) {
        // 成功時：フォームをリセットしてモーダルを閉じる
        reset();
        setOpen(false);
        return;
      }

      // 失敗時：サーバー（または登録処理）の失敗として表示
      const message = { message: '失敗しました。もう一度お試しください。' };
      if (inputKeyword === 'add') {
        message.message = '登録に失敗しました。もう一度お試しください。';
      } else if (inputKeyword === 'edit') {
        message.message = '編集に失敗しました。もう一度お試しください。';
      }
      setError('root.serverError', {
        type: 'manual',
        message: message.message,
      });
    } catch (error) {
      console.error('登録処理中にエラーが発生しました', error);
      setError('root.serverError', {
        type: 'manual',
        message: '登録中にエラーが発生しました。ネットワークや設定を確認してください。',
      });
    }
  };
  return (
    <>
      <Dialog.Root
        size="cover"
        placement="center"
        motionPreset="slide-in-bottom"
        open={open}
        onOpenChange={(e) => {
          setOpen(e.open);
          if (e.open) {
            // 再オープン時に前回のサーバーエラー表示を消す
            clearErrors('root');
          }
        }}
      >
        <Dialog.Trigger asChild>
          <Button bgColor="red.300" data-testid="open-dialog-button" type="button" aria-label={inputKeyword === 'add' ? '新規登録用のモーダルを開くボタン' : inputKeyword === 'edit' ? '編集用のモーダルを開くボタン' : '新規登録する'}>
            {inputKeyword === 'add' ? '新規登録する' : inputKeyword === 'edit' ? '編集する' : '新規登録する'}
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title data-testid="dialog-title">{inputKeyword === 'add' ? '新規登録' : inputKeyword === 'edit' ? '記録編集' : 'その他'}</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spaceY={4}>
                    {errors.root?.serverError && (
                      <Text role="alert" aria-live="polite" data-testid="error-submit" style={{ color: 'red' }} textStyle="sm">
                        {errors.root.serverError.message}
                      </Text>
                    )}
                    <Field.Root>
                      <Field.Label htmlFor="detail">学習内容</Field.Label>
                      <Input
                        type="text"
                        id="detail"
                        data-testid="input-text"
                        aria-label="新しい学習を入力"
                        {...register('detail', {
                          required: '内容の入力は必須です',
                        })}
                      />
                      {errors.detail && (
                        <Text data-testid="error-detail" style={{ color: 'red' }} textStyle="xs">
                          {errors.detail.message}
                        </Text>
                      )}
                    </Field.Root>

                    <Field.Root>
                      <Field.Label htmlFor="time">学習時間</Field.Label>
                      <Input
                        type="number"
                        id="time"
                        data-testid="input-time"
                        aria-label="新しい学習時間を入力"
                        {...register('time', {
                          setValueAs: (value) => (value === '' || value === 0 || value === null || value === undefined ? undefined : Number(value)),
                          required: '時間の入力は必須です',
                          validate: (value) => (typeof value === 'number' && !Number.isNaN(value) ? true : '時間の入力は必須です'),
                          min: { value: 0, message: '時間は0以上である必要があります' },
                        })}
                      />
                      {errors.time && (
                        <Text data-testid="error-time" style={{ color: 'red' }} textStyle="xs">
                          {errors.time.message}
                        </Text>
                      )}
                    </Field.Root>

                    <Text textStyle="md">
                      入力されている内容:
                      <Text textStyle="sm" as={'span'}>
                        {detail}
                      </Text>
                    </Text>
                    <Text textStyle="md">
                      入力されている時間:
                      <Text textStyle="sm" as={'span'}>
                        {time}時間
                      </Text>
                    </Text>
                  </Stack>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <Button bgColor="gray.300" variant="outline">
                        キャンセル
                      </Button>
                    </Dialog.ActionTrigger>
                    <Button type="submit" bgColor="red.300" data-testid="registration-button" loading={isSubmitting} aria-label="学習内容と時間を登録するボタン">
                      {inputKeyword === 'add' ? '登録' : inputKeyword === 'edit' ? '編集' : '登録'}
                    </Button>
                  </Dialog.Footer>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
});
