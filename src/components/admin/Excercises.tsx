import React from 'react';
import { 
  List, ListProps, Datagrid, TextField, EditButton, DeleteButton,
  Create, CreateProps, SimpleForm, TextInput, BooleanInput,
  Edit, EditProps
} from 'react-admin';
import { GiWeightLiftingUp } from 'react-icons/gi';

const AdminForm = (): JSX.Element => {
  return (
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="desc" multiline label="Description" />
      <BooleanInput source="useDumbbells" label="Use dumbbells" />
    </SimpleForm>
  );
};

export const ExcerciseIcon = GiWeightLiftingUp;

export function ExcerciseList(props: ListProps): JSX.Element {
  return (
    <List {...props}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="name" />
        <EditButton basePath="/excercises" />
        <DeleteButton basePath="/excercises" />
      </Datagrid>
    </List>
  );
};

export function ExcerciseCreate(props: CreateProps): JSX.Element {
  return (
    <Create title="Create an excercise" {...props}>
      <AdminForm />
    </Create>
  );
};

export function ExcerciseEdit(props: EditProps): JSX.Element {
  return (
    <Edit title="Edit excercise" {...props}>
      <AdminForm />
    </Edit>
  );
};