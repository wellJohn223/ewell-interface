import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Row, Col } from 'antd';
import { useEffectOnce } from 'react-use';
import { useCardCol } from '../../hooks/useCardCol';
import ProjectCard from '../Card';
import Empty from 'components/Empty';
import { useGetList, IListData } from '../../hooks/useGetList';
import { ProjectType } from 'types/project';
import InfiniteList from 'components/InfiniteList';
import { emitLoading } from 'utils/events';

const Projects: React.FC = () => {
  const [colNum] = useCardCol();
  const [activeItems, setActiveItems] = useState<IListData['activeItems']>([]);
  const [closedItems, setClosedItems] = useState<IListData['closedItems']>([]);
  const [closedListPage, setClosedListPage] = useState(0);
  const [loadAllClosedItems, setLoadAllClosedItems] = useState(false);
  const { getList } = useGetList();

  const getActiveProjects = useCallback(async () => {
    const { activeItems } = await getList({ types: ProjectType.ACTIVE });
    setActiveItems(activeItems || []);
  }, [getList]);

  const getClosedProject = useCallback(
    async (loading: boolean = false) => {
      console.log('getClosed-project');
      if (loading) emitLoading(true, { text: 'loading...' });

      const list = await getList({
        types: ProjectType.CLOSED,
        skipCount: closedItems.length,
        maxResultCount: colNum * 3,
        // maxResultCount: 3,
      });

      if (loading) emitLoading(false);

      if (list.closedItems.length === 0) return;
      const newList = closedItems.concat(list.closedItems);
      setClosedItems(newList);
      setClosedListPage(closedListPage + 1);
      setLoadAllClosedItems(newList.length >= list.totalCount);
    },
    [closedItems, closedListPage, colNum, getList],
  );

  useEffectOnce(() => {
    getActiveProjects();
    getClosedProject();
  });

  const render = useMemo(() => {
    if (!activeItems.length && !closedItems.length) {
      return (
        <>
          <div className="project-type">All Projects</div>
          <Empty className="project-empty-full" text="There are currently no projects, please stay tuned" />
        </>
      );
    }

    return (
      <>
        <div className="project-type">Active Projects</div>
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
          <Empty text="There are currently no active projects, please stay tuned" />
        )}
        {!!closedItems.length && (
          <InfiniteList
            showScrollToTop={false}
            loaded={loadAllClosedItems}
            loadMoreData={getClosedProject}
            id="project-list-scroll"
            dataLength={closedItems.length}>
            {!!closedItems.length && <div className="project-type">Closed Projects</div>}
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
  }, [activeItems, closedItems, colNum, getClosedProject, loadAllClosedItems]);

  return <div className="project-page">{render}</div>;
};

export default Projects;
