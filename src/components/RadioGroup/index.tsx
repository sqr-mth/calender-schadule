import React from "react";
import type { RadioChangeEvent } from "antd";
import { Radio } from "antd";

interface RadioComponentProps {
  data: { [key: number]: string };
  valueSelected?: number;
  OnChange: (e: RadioChangeEvent) => void;
}

const RadioComponent = ({ valueSelected, OnChange, data }: RadioComponentProps) => {
  return (
    <Radio.Group onChange={OnChange} value={valueSelected}>
      {Object.entries(data).map(([key, value]) => (
        <Radio value={key} key={key}>
          {value}
        </Radio>
      ))}
    </Radio.Group>
  );
};

export default RadioComponent;
