package controllers;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import models.Robot;

import play.Logger;
import play.Play;
import play.libs.Images;
import play.mvc.Controller;

public class Robots extends Controller {
	
	public static void robotScript(Long id) {
		Robot r = Robot.findById(id);
		notFoundIfNull(r);
		renderText(r.script);
	}
	
	public static void robot(Long id, String idColor) throws Exception {
		notFoundIfNull(id);
		Robot robot = Robot.findById(id);
		notFoundIfNull(robot);
		if(idColor==null) idColor = "crazy";

        Object script = reverse();{robotScript(id);}
        
        Map description = new HashMap();
        description.put("name", robot.name);
        description.put("script", script.toString());
        description.put("body", Images.toBase64(Play.getFile("robots-base/"+idColor+"/body.png")));
        description.put("turret", Images.toBase64(Play.getFile("robots-base/"+idColor+"/turret.png")));
        description.put("radar", Images.toBase64(Play.getFile("robots-base/"+idColor+"/radar.png")));
        description.put("bullet", Images.toBase64(Play.getFile("robots-base/"+idColor+"/bullet.png")));
        renderJSON(description);
	}
	
	public static void robots(Integer limit) {
		if(limit==null || limit < 1) limit = 8;
		List<String> urls = new ArrayList<String>();
		List<Robot> robots = Robot.getRobots(limit);
		for(Robot r : robots)
			urls.add("/robots/user-"+r.id);
		renderJSON(urls);
	}
	
	private static void verifyUserId() {
		if(!session.contains("user")) {
			session.put("user", UUID.randomUUID().toString());
		}
	}
	
	public static void coding() {
		verifyUserId();
		int limit = 8;
		List<Robot> robots = Robot.getRobots(limit);
		Robot robot = Robot.findOrCreate(session.get("user"));
		if(!robots.contains(robot))
			robots.add(robot);
		render(robots, robot);
	}
	
	public static void update(String name, String script) {
		verifyUserId();
		Robot existingRobot = Robot.findOrCreate(session.get("user"));
		if(name != null)
			existingRobot.name = name;
		existingRobot.script = script;
		existingRobot.date = new Date();
		existingRobot.save();
		coding();
	}

	public static void run(Integer limit) {
		if(limit==null || limit < 1) limit = 8;
		List<Robot> robots = Robot.getRobots(limit);
		int width = 1920, height = 960;
		render(robots, width, height);
	}
	
}
