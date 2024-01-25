import clsx from 'clsx';
import { Flex } from 'antd';
import { Modal, IModalProps, Button, Typography, FontWeightEnum, HashAddress } from 'aelf-design';
import { success } from 'assets/images';
import { DEFAULT_CHAIN_ID } from 'constants/network';
import './styles.less';

const { Title, Text } = Typography;

interface ISuccessModalProps {
  modalProps: IModalProps;
  data: {
    amountList: {
      amount: string;
      symbol: string;
    }[];
    description: string;
    boxData: {
      label: string;
      value: string;
    };
  };
}

export default function SuccessModal({ modalProps, data: { amountList, description, boxData } }: ISuccessModalProps) {
  return (
    <Modal
      {...modalProps}
      wrapClassName={clsx('project-info-success-modal-wrapper', modalProps.wrapClassName)}
      footer={null}
      centered>
      <Flex vertical gap={24}>
        <Flex vertical gap={8} align="center">
          <img className="success-icon" src={success} alt="success" />
          <Flex vertical>
            {amountList.map((item, index) => (
              <Flex key={index} gap={8} align="baseline" justify="center">
                <Title fontWeight={FontWeightEnum.Medium} level={4}>
                  {item.amount}
                </Title>
                <Title fontWeight={FontWeightEnum.Medium}>{item.symbol}</Title>
              </Flex>
            ))}
          </Flex>
          <Text className="text-center" fontWeight={FontWeightEnum.Medium}>
            {description}
          </Text>
        </Flex>
        <Flex className="modal-box-data-wrapper" justify="space-between">
          <Text>{boxData.label}</Text>
          {/* TODO: jump */}
          <HashAddress
            className="hash-address-small"
            preLen={8}
            endLen={9}
            chain={DEFAULT_CHAIN_ID}
            address={boxData.value}
          />
        </Flex>
        <Flex justify="center">
          <Button className="modal-single-button" type="primary" onClick={modalProps.onOk}>
            OK
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}
