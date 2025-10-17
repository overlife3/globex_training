import "./App.css";
import CollaboratorsWithoutSubscribeFilteredList from "./components/CollaboratorsWithoutSubscribeFilteredList";
import CollaboratorsWithSubscribeFilteredList from "./components/CollaboratorsWithSubscribeFilteredList";
import SubdivisionsFilteredList from "./components/SubdivisionsFilteredList";
import { Tabs } from "./components/ui/Tabs";
function App() {
  return (
    <div className="app">
      <h2>Задание 1. Настраиваемый шаблон</h2>
      <Tabs mainTab="subdivisions">
        <Tabs.List>
          <Tabs.Tab label="Подразделения" value="subdivisions" />
          <Tabs.Tab label="Сотрудники" value="collaborators" />
          <Tabs.Tab label="Команда" value="team" />
        </Tabs.List>
        <Tabs.Panel value="subdivisions">
          <SubdivisionsFilteredList />
        </Tabs.Panel>
        <Tabs.Panel value="collaborators">
          <CollaboratorsWithoutSubscribeFilteredList />
        </Tabs.Panel>
        <Tabs.Panel value="team">
          <CollaboratorsWithSubscribeFilteredList />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default App;
