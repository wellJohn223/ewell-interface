import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Row, Col } from 'antd';
import { useEffectOnce } from 'react-use';
import { useCardCol } from '../../hooks/useCardCol';
import ProjectCard from '../Card';
import Empty from 'components/Empty';
import { useGetList, IListData } from '../../hooks/useGetList';
import { ProjectType } from 'types/project';
import InfiniteList from 'components/InfiniteList';
import { emitLoading } from 'utils/events';
import myEvents from 'utils/myEvent';

const Projects: React.FC = () => {
  const [colNum] = useCardCol();
  const [loading, setLoading] = useState(true);
  const [activeItems, setActiveItems] = useState<IListData['activeItems']>([]);
  const [closedItems, setClosedItems] = useState<IListData['closedItems']>([]);
  const [loadAllClosedItems, setLoadAllClosedItems] = useState(false);
  const { getList } = useGetList();

  const getActiveProjects = useCallback(async () => {
    const { activeItems } = await getList({ types: ProjectType.ACTIVE });
    setLoading(false);
    setActiveItems(activeItems || []);
  }, [getList]);

  const getClosedProject = useCallback(async () => {
    console.log('getClosed-project');
    const list = await getList({
      types: ProjectType.CLOSED,
      skipCount: closedItems.length,
      maxResultCount: colNum * 3,
    });
    setLoading(false);
    if (list.closedItems.length === 0) return;
    const newList = closedItems.concat(list.closedItems);
    setClosedItems(newList);
    setLoadAllClosedItems(newList.length >= list.totalCount);
  }, [closedItems, colNum, getList]);

  useEffect(() => {
    emitLoading(loading);
  }, [loading]);

  const initList = useCallback(() => {
    getActiveProjects();
    getClosedProject();
  }, [getActiveProjects, getClosedProject]);

  const initListRef = useRef(initList);
  initListRef.current = initList;
  useEffect(() => {
    const { remove } = myEvents.AuthToken.addListener(() => {
      initListRef.current?.();
    });
    return () => remove();
  }, []);

  useEffectOnce(() => initList);

  const render = useMemo(() => {
    if (loading) return null;

    if (!activeItems.length && !closedItems.length) {
      return (
        <>
          <div className="project-type">All Projects</div>
          <Empty className="project-empty-full" text="No sales at the moment. Please stay tuned for updates." />
        </>
      );
    }

    return (
      <>
        <div className="project-type">Ongoing</div>
        {activeItems.length ? (
          <div className="project-list-wrapper">
            <Row gutter={[24, 24]}>
              {activeItems.map((item, index) => (
                <Col span={24 / colNum} key={index}>
                  <ProjectCard data={item} />
                </Col>
              ))}
            </Row>
          </div>
        ) : (
          <Empty text="No ongoing sales at the moment. Please stay tuned for updates." />
        )}
        {!!closedItems.length && (
          <InfiniteList
            showScrollToTop={false}
            loaded={loadAllClosedItems}
            loadMoreData={getClosedProject}
            id="project-list-scroll"
            dataLength={closedItems.length}>
            {!!closedItems.length && <div className="project-type">Closed</div>}
            <Row gutter={[24, 24]}>
              {closedItems.map((item) => (
                <Col span={24 / colNum} key={item.id}>
                  <ProjectCard data={item} />
                </Col>
              ))}
            </Row>
          </InfiniteList>
        )}
      </>
    );
  }, [activeItems, closedItems, colNum, getClosedProject, loadAllClosedItems, loading]);

  return <div className="project-page">{render}</div>;
};

export default Projects;
