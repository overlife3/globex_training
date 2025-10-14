import "./App.css";
import CollaboratorsFilteredList from "./components/CollaboratorsFilteredList";
import SubdivisionsFilteredList from "./components/SubdivisionsFilteredList";
import { Tabs } from "./components/ui/Tabs";
function App() {
  return (
    <div className="app">
      <h2>Задание 1. Настраиваемый шаблон</h2>
      <Tabs>
        <Tabs.List>
          <Tabs.Tab label="Подразделения" value={0} />
          <Tabs.Tab label="Сотрудники" value={1} />
        </Tabs.List>
        <Tabs.Panel value={0}>
          <SubdivisionsFilteredList />
        </Tabs.Panel>
        <Tabs.Panel value={1}>
          <CollaboratorsFilteredList />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default App;
