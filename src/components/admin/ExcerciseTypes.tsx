import React from 'react';
import {
  List, ListProps, Datagrid, TextField, EditButton, DeleteButton,
  Create, CreateProps, SimpleForm, TextInput,
  Edit, EditProps
} from 'react-admin';
import { GiWeightLiftingUp } from 'react-icons/gi';

const AdminForm = (): JSX.Element => {
  return (
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  )
};

export const ExcerciseTypeIcon = GiWeightLiftingUp;

export function ExcerciseTypeList(props: ListProps) {
  return (
    <List {...props}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="name" />
        <EditButton basePath="excerciseTypes" />
        <DeleteButton basePath="excerciseTypes" />
      </Datagrid>
    </List>
  )
};

export function ExcerciseTypeCreate(props: CreateProps) {
  return (
    <Create title="Create an excercise type" {...props}>
      <AdminForm />
    </Create>
  )
};

export function ExcerciseTypeEdit(props: EditProps) {
  return (
    <Edit title="Edit excercise type" {...props}>
      <AdminForm />
    </Edit>
  )
};