import { DB } from '../config/db';

const insertTaskWidgetPerTask = async (widgetType, taskId, widgetId) => {
    const db = DB.getInstance();
    const taskWidget = db.TaskWidget;
    try{

        let widgetsInfo;
        switch (widgetType) {
            case 'URGENCY': {
                const widgetUrgency = await taskWidget.create({
                    taskId: taskId,
                    widgetId: widgetId,
                    urgency: 3
                });
                widgetsInfo = widgetUrgency.dataValues;
                break;
            }
            case 'COMPLETED': {
                const widgetCompleted = await taskWidget.create({
                    taskId: taskId,
                    widgetId: widgetId,
                    completed_percentage: 0
                });
                widgetsInfo = widgetCompleted.dataValues;
                break;
            }
            case 'RATING': {
                const widgetRating = await taskWidget.create({
                    taskId: taskId,
                    widgetId: widgetId,
                    rating: 3,
                } );
                widgetsInfo = widgetRating.dataValues;
                break;
            }
             
        default:
            break;
    }
        return widgetsInfo;

    } catch (e){
        console.log(e);
        throw (new Error('Unable to insert task widget'));
    }
}

export default {
    insertTaskWidgetPerTask
}