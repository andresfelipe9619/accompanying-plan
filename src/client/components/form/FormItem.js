import 'date-fns';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from '@material-ui/pickers';
import esLocale from 'date-fns/locale/es';
// import MuiPhoneNumber from 'material-ui-phone-number'
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import Autocomplete from '@material-ui/lab/Autocomplete';

export default function FormItem(props) {
  const {
    item,
    values,
    errors,
    touched,
    dependencies,
    isSubmitting,
    handleChange,
    handleBlur,
  } = props;

  if (!item?.form) return null;
  const {
    size,
    type,
    dependency,
    visibleWith,
    inputType = 'text',
    ...fieldProps
  } = item.form;
  const key = item.name;
  const value = values[key];
  const canRender = name => {
    if (!visibleWith) return type === name;
    return type === name && values[visibleWith];
  };
  const options = (dependencies || {})[dependency] || [];

  const content = {
    date: canRender('date') && (
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
        <KeyboardDateTimePicker
          disableToolbar
          variant="inline"
          format="dd/MM/yyyy HH:mm"
          margin="normal"
          id={key}
          style={{ margin: 0 }}
          inputVariant="outlined"
          label={item.label}
          disabled={isSubmitting}
          onBlur={handleBlur}
          InputAdornmentProps={{ position: 'start' }}
          onChange={date => {
            const event = { target: { name: key, value: date } };
            return handleChange(event);
          }}
          value={value || new Date()}
        />
      </MuiPickersUtilsProvider>
    ),
    autocomplete: canRender('autocomplete') && (
      <Autocomplete
        id={key}
        freeSolo
        options={options.map(option => option.label)}
        renderInput={params => (
          <TextField
            fullWidth
            label={item.label}
            disabled={isSubmitting}
            onBlur={handleBlur}
            onChange={handleChange}
            value={value}
            type={inputType}
            error={!!touched[key] && !!errors[key]}
            variant="outlined"
            helperText={!!touched[key] && errors[key] ? errors[key] : ''}
            {...params}
            {...fieldProps}
          />
        )}
      />
    ),
    input: canRender('input') && (
      <TextField
        fullWidth
        id={key}
        label={item.label}
        disabled={isSubmitting}
        onBlur={handleBlur}
        onChange={handleChange}
        value={value}
        type={inputType}
        error={!!touched[key] && !!errors[key]}
        variant="outlined"
        helperText={!!touched[key] && errors[key] ? errors[key] : ''}
        {...fieldProps}
      />
    ),
    select: canRender('select') && (
      <FormControl fullWidth variant="outlined">
        <InputLabel id={`${key}-label`}>{item.label}</InputLabel>
        <Select
          labelId={`${key}-label`}
          id={key}
          name={key}
          disabled={isSubmitting}
          value={value || ''}
          label={item.label}
          onChange={handleChange}
        >
          {options.map(d => (
            <MenuItem key={d.value} value={d.value}>
              {d.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {!!touched[key] && errors[key] ? errors[key] : ''}
        </FormHelperText>
      </FormControl>
    ),
  };
  return (
    <Grid item xs={12} md={size}>
      {content[type]}
    </Grid>
  );
}
