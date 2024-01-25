import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Button, IButtonProps } from 'aelf-design';
import { edit } from 'assets/images';
import './styles.less';

interface IEditButtonProps extends IButtonProps {
  projectId?: string;
  size?: 'large' | 'small';
}

export default function EditButton({ projectId, size = 'large', ...buttonProps }: IEditButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      {...buttonProps}
      className={clsx('common-edit-button', buttonProps.className)}
      size={size}
      icon={<img className={`${size}-icon`} src={edit} alt="edit" />}
      onClick={() => {
        if (projectId) {
          navigate(`/edit-information/${projectId}`);
        }
      }}
    />
  );
}
