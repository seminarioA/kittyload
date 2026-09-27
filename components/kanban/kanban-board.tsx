"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCalendarDays,
  faCheck,
  faEllipsis,
  faHouse,
  faList,
  faMagnifyingGlass,
  faPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useMemo, useState } from "react";

type ColumnId = "backlog" | "todo" | "progress" | "review" | "done";

type Task = {
  id: string;
  key: string;
  title: string;
  column: ColumnId;
  priority: "Low" | "Medium" | "High";
  due?: string;
  assignees: string[];
};

const columns: { id: ColumnId; title: string; terminal?: boolean }[] = [
  { id: "backlog", title: "Backlog" },
  { id: "todo", title: "To do" },
  { id: "progress", title: "In progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done", terminal: true },
];

const initialTasks: Task[] = [
  { id: "1", key: "KIT-12", title: "Definir onboarding del workspace", column: "backlog", priority: "Medium", assignees: ["AS"] },
  { id: "2", key: "KIT-18", title: "Crear reglas RLS del proyecto", column: "todo", priority: "High", due: "Hoy", assignees: ["AS", "MV"] },
  { id: "3", key: "KIT-21", title: "Diseñar estado vacío del tablero", column: "progress", priority: "Low", due: "28 Sep", assignees: ["MV"] },
  { id: "4", key: "KIT-24", title: "Validar interacción drag and drop", column: "review", priority: "Medium", due: "29 Sep", assignees: ["AS"] },
  { id: "5", key: "KIT-03", title: "Crear estructura dev / qa / main", column: "done", priority: "High", assignees: ["AS"] },
];

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="task-card"
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.58 : 1,
      }}
    >
      <div className="task-card__top">
        <span className="task-key">{task.key}</span>
        <button className="icon-button compact" aria-label="Más opciones">
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </div>
      <h3>{task.title}</h3>
      <div className="task-meta">
        <span className={`priority priority--${task.priority.toLowerCase()}`}>{task.priority}</span>
        {task.due && (
          <span className="due">
            <FontAwesomeIcon icon={faCalendarDays} />
            {task.due}
          </span>
        )}
      </div>
      <div className="task-footer">
        <div className="avatars" aria-label="Responsables">
          {task.assignees.map((initials) => <span key={initials} className="avatar">{initials}</span>)}
        </div>
      </div>
    </article>
  );
}

function Column({ id, title, terminal, tasks }: { id: ColumnId; title: string; terminal?: boolean; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section ref={setNodeRef} className={`kanban-column ${isOver ? "kanban-column--over" : ""}`}>
      <header className="column-header">
        <div className="column-title">
          {terminal && (
            <span className="terminal-dot">
              <FontAwesomeIcon icon={faCheck} />
            </span>
          )}
          <h2>{title}</h2>
          <span className="count">{tasks.length}</span>
        </div>
        <button className="icon-button compact" aria-label={`Agregar en ${title}`}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </header>
      <div className="column-stack">
        {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        {tasks.length === 0 && <div className="column-empty">Suelta una tarea aquí</div>}
      </div>
    </section>
  );
}

export function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => Object.fromEntries(columns.map((column) => [
    column.id,
    tasks.filter((task) => task.column === column.id),
  ])) as Record<ColumnId, Task[]>, [tasks]);

  function handleDragEnd(event: DragEndEvent) {
    const target = event.over?.id as ColumnId | undefined;
    if (!target) return;
    setTasks((current) => current.map((task) =>
      task.id === event.active.id ? { ...task, column: target } : task
    ));
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark" aria-label="kittyload">k</div>
        <nav className="sidebar-nav" aria-label="Principal">
          <button className="side-item active" aria-label="Inicio"><FontAwesomeIcon icon={faHouse} /></button>
          <button className="side-item" aria-label="Lista"><FontAwesomeIcon icon={faList} /></button>
          <button className="side-item" aria-label="Calendario"><FontAwesomeIcon icon={faCalendarDays} /></button>
          <button className="side-item" aria-label="Miembros"><FontAwesomeIcon icon={faUsers} /></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile-dot">AS</div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Producto / Kittyload</p>
            <div className="title-row">
              <h1>Product board</h1>
              <span className="status-pill">Activo</span>
            </div>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <input aria-label="Buscar tareas" placeholder="Buscar" />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" aria-label="Notificaciones"><FontAwesomeIcon icon={faBell} /></button>
            <button className="primary-button"><FontAwesomeIcon icon={faPlus} />Nueva tarea</button>
          </div>
        </header>

        <section className="toolbar">
          <div className="view-tabs" role="tablist" aria-label="Vista">
            <button className="view-tab active" role="tab">Board</button>
            <button className="view-tab" role="tab">Lista</button>
            <button className="view-tab" role="tab">Calendario</button>
          </div>
          <div className="toolbar-right">
            <button className="quiet-button">Todos los responsables</button>
            <button className="quiet-button">Filtros</button>
          </div>
        </section>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <section className="kanban-board" aria-label="Tablero Kanban">
            {columns.map((column) => (
              <Column key={column.id} {...column} tasks={grouped[column.id]} />
            ))}
          </section>
        </DndContext>
      </main>
    </div>
  );
}
