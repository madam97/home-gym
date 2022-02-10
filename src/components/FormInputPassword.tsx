import React, { useState } from 'react';
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai'; 

type FormInputPasswordProps = {
  name: string,
  value: string,
  setValue(value: string): void,
  placeholder: string
};

export default function FormInputPassword({ name, value, setValue, placeholder }: FormInputPasswordProps) {

  const [hidePassword, setHidePassword] = useState<boolean>(true);

  /**
   * Shows/hides the password
   * @param event
   */
  const toggleHidePassword = (event: React.FormEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    setHidePassword(!hidePassword);
  }

  return (
    <div className="input-block input-block-btn-right">
      <input 
        className="input"
        name={name}
        type={hidePassword ? 'password' : 'text'}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        placeholder={placeholder}
      />
      
      <button className="input-btn" onClick={(event) => toggleHidePassword(event)}>
        {hidePassword && <AiOutlineEyeInvisible className="icon" />}
        {!hidePassword && <AiOutlineEye className="icon" />}
      </button>
    </div>
  )
}