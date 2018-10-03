export const PROJECT_SEARCH = 'PROJECT_SEARCH';

// 项目筛选条件
export function setProjectSeachVal(data) {
    return {
        type: PROJECT_SEARCH,
        payload: data
    }
}