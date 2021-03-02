import React from 'react';

const InputWithLabel = ({id, label, value, type='text', isFocused, onInputChange, children}) =>  {
    const inputRef = React.useRef();
  
    React.useEffect(() => {
      if (isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isFocused]);
  
    return (
      <>
        <label htmlFor={id} className="label">{children}</label>
        &nbsp;
        <input ref={inputRef} id={id} type={type} value={value} onChange={onInputChange} className="input"/>
      </>
    );
};
  
  export default InputWithLabel;