import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react';
import { memo } from 'react';
import { InputForm } from './InputForm';
type ArchiveProps = {
  records: {
    id: string;
    title: string;
    time: number | null;
  }[];
  onClickDeleteRecord: (recordId: string) => Promise<void> | void;
  onClickEditRecord: (recordId: string, title: string, time: number) => Promise<boolean>;
};

export const Archive = memo((props: ArchiveProps) => {
  const { records, onClickDeleteRecord, onClickEditRecord } = props;
  return (
    <Box p={15}>
      <Heading data-testid="title" mb={2}>
        学習記録一覧
      </Heading>
      <Box as="ul" listStyleType="none" data-testid="list" display={'flex'} flexDirection={'column'} gap={3}>
        {records.map((record) => (
          <Stack as="li" key={record.id} direction="row" align="center">
            <Text textStyle="md">
              {record.title} | {record.time}時間
            </Text>
            <Button
              onClick={() => {
                onClickDeleteRecord(record.id);
              }}
              data-testid="delete-button"
              bgColor="gray.300"
              color="black"
            >
              削除
            </Button>
            <InputForm inputKeyword={'edit'} record={record} onClickEditRecord={onClickEditRecord} />
          </Stack>
        ))}
      </Box>
    </Box>
  );
});
