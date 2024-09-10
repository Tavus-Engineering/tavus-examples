import { Select, SelectContent, SelectTrigger, SelectItem } from '../ui/select';

export const SelectDevice = ({ value, devices, onChange, Icon }: {
  value: string | undefined;
  devices: { device: MediaDeviceInfo }[];
  onChange: (value: string) => void;
  Icon: React.ElementType;
}) => {

  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className='h-10 rounded-md gap-2 bg-slate-500/70 text-white'>
        <span>
          <Icon size={16} />
        </span>
      </SelectTrigger>
      <SelectContent className='z-10'>
        {devices.map(({ device }) => (
          <SelectItem
            key={device.deviceId}
            value={device.deviceId}
          >
            {device.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}