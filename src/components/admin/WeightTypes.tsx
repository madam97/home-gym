import React from 'react';
import {
  List, ListProps, Datagrid, TextField, EditButton, DeleteButton,
  Create, CreateProps, SimpleForm, TextInput,
  Edit, EditProps
} from 'react-admin';
import { CgGym } from 'react-icons/cg';

const AdminForm = (): JSX.Element => {
  return (
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="zeroWeight" label="Label if weight is zero" />
    </SimpleForm>
  )
};

export const WeightTypeIcon = CgGym;

export function WeightTypeList(props: ListProps) {
  return (
    <List {...props}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="zeroWeight" label="Label if weight is zero" />
        <EditButton basePath="weightTypes" />
        <DeleteButton basePath="weightTypes" />
      </Datagrid>
    </List>
  )
};

export function WeightTypeCreate(props: CreateProps) {
  return (
    <Create title="Create a weight type" {...props}>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="zeroWeight" label="Label if weight is zero" />
      </SimpleForm>
    </Create>
  )
};

export function WeightTypeEdit(props: EditProps) {
  return (
    <Edit title="Edit weight type" {...props}>
      <SimpleForm>
        <TextInput source="name" />
        <TextInput source="zeroWeight" label="Label if weight is zero" />
      </SimpleForm>
    </Edit>
  )
};