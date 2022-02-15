import React from 'react';
import { Admin, Resource } from 'react-admin';
import restProvider from 'ra-data-json-server';
import { ExcerciseTypeIcon, ExcerciseTypeList, ExcerciseTypeCreate, ExcerciseTypeEdit } from '../components/admin/ExcerciseTypes';
import { ExcerciseIcon, ExcerciseList, ExcerciseCreate, ExcerciseEdit } from '../components/admin/Excercises';
import { WeightTypeIcon, WeightTypeList, WeightTypeCreate, WeightTypeEdit } from '../components/admin/WeightTypes';

export default function AdminMain(): JSX.Element {
  return (
    <Admin dataProvider={restProvider(process.env.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL : '')}>
      <Resource name="excerciseTypes" icon={ExcerciseTypeIcon} list={ExcerciseTypeList} create={ExcerciseTypeCreate} edit={ExcerciseTypeEdit} options={{ label: "Excercise types" }} />
      <Resource name="excercises" icon={ExcerciseIcon} list={ExcerciseList} create={ExcerciseCreate} edit={ExcerciseEdit} />
      <Resource name="weightTypes" icon={WeightTypeIcon} list={WeightTypeList} create={WeightTypeCreate} edit={WeightTypeEdit} options={{ label: "Weight types" }} />
    </Admin>
  );
}